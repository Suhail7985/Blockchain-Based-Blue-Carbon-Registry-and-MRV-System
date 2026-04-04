import Plantation from '../models/Plantation.js';
import CarbonSettings from '../models/CarbonSettings.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import { calculateCarbon } from './carbonCalculation.js';
import { 
  generatePlantationHash, 
  storePlantationHash, 
  mintCarbonToken 
} from './blockchainService.js';
import { PLANTATION_STATUS } from '../constants/plantationStatus.js';
import { sendPlantationStatusEmail } from './emailService.js';

/**
 * Finalizes the approval of a plantation:
 * 1. Calculates Carbon based on scientific/config factors
 * 2. Records on Blockchain
 * 3. Mints Tokens
 * 4. Logs Audit
 * 5. Notifies User
 */
export async function finalizePlantationApproval(plantationId, officerId, role, notes = '') {
  const plantation = await Plantation.findById(plantationId).populate('userId', 'walletAddress name email');
  if (!plantation) throw new Error('Plantation not found');

  const userWallet = plantation.userId?.walletAddress?.trim();
  const previousStatus = plantation.status;

  // 1. Carbon Calculation (Scientific)
  // We'll try to use the scientific registry first, then fallback to global settings
  // Passing mrvData to prioritize granular biomass/SOC measurements (SIH Requirement)
  const carbonCalc = await calculateCarbon(plantation.treeCount, plantation.speciesName, plantation.mrvData);
  plantation.carbonCalculation = carbonCalc;
  plantation.status = PLANTATION_STATUS.VERIFIED;

  const verificationRecord = {
    adminId: officerId,
    decision: 'approved',
    timestamp: new Date(),
    notes,
  };

  if (role === 'admin') {
    plantation.nccrVerification = verificationRecord;
  } else {
    plantation.panchayatVerification = {
        panchayatId: officerId,
        decision: 'approved',
        timestamp: new Date(),
        remarks: notes
    };
  }

  plantation.auditLog = plantation.auditLog || [];
  plantation.auditLog.push({ 
    action: `${role}_approved_final`, 
    by: officerId, 
    timestamp: new Date(), 
    notes 
  });
  
  await plantation.save();

  await AuditLog.create({
    plantationId: plantation._id,
    action: `${role}_approved_final`,
    performedBy: officerId,
    role,
    previousStatus,
    newStatus: plantation.status,
    details: { notes, autonomous: role === 'panchayat' },
  });

  // 2. Blockchain Recording
  if (!plantation.blockchainTxHash) {
    try {
      plantation.status = PLANTATION_STATUS.BLOCKCHAIN_PENDING;
      await plantation.save();

      if (!userWallet) {
        throw new Error('User wallet address is missing. Please ask the user to add a wallet to their profile.');
      }

      const hashPayload = {
        plantationId: plantation.plantationId,
        landId: plantation.landId?._id || plantation.landId,
        treeCount: plantation.treeCount,
        areaHectares: plantation.areaHectares,
        speciesName: plantation.speciesName,
        timestamp: plantation.submissionTimestamp,
      };
      plantation.blockchainHash = generatePlantationHash(hashPayload);

      const bcResult = await storePlantationHash(
        plantation.plantationId,
        userWallet,
        plantation.blockchainHash
      );

      if (bcResult?.success) {
        plantation.blockchainTxHash = bcResult.transactionHash;
        plantation.blockNumber = bcResult.blockNumber;
        plantation.blockchainGasUsed = bcResult.gasUsed;
        plantation.blockchainTimestamp = bcResult.timestamp;
        plantation.status = PLANTATION_STATUS.BLOCKCHAIN_CONFIRMED;
        await plantation.save();
      } else {
        // Revert to VERIFIED if blockchain storage failed so it can be retried
        plantation.status = PLANTATION_STATUS.VERIFIED;
        await plantation.save();
        console.error(`Blockchain storage failed for ${plantation.plantationId}: ${bcResult?.error}`);
        
        await AuditLog.create({
          plantationId: plantation._id,
          action: 'blockchain_storage_failed',
          performedBy: officerId,
          role,
          details: { error: bcResult?.error || 'Unknown blockchain error' },
        });
      }
    } catch (bcError) {
      plantation.status = PLANTATION_STATUS.VERIFIED;
      await plantation.save();
      console.error(`Unexpected blockchain error for ${plantation.plantationId}:`, bcError.message);
      
      await AuditLog.create({
        plantationId: plantation._id,
        action: 'blockchain_verification_error',
        performedBy: officerId,
        role,
        details: { error: bcError.message },
      });
    }
  }

  // 3. Token Minting
  if (plantation.status === PLANTATION_STATUS.BLOCKCHAIN_CONFIRMED && !plantation.tokenTxHash) {
    try {
      if (!userWallet) {
        // This should have been caught above, but safety first
        console.error('Wallet missing during minting step');
        return plantation;
      }
      
      const mintResult = await mintCarbonToken(userWallet, carbonCalc.tokens, plantation.plantationId);
      if (mintResult?.success) {
        plantation.tokenTxHash = mintResult.transactionHash;
        plantation.status = PLANTATION_STATUS.TOKEN_MINTED;
        await plantation.save();
        
        // Final Audit Log for minting
        await AuditLog.create({
          plantationId: plantation._id,
          action: 'token_minted',
          performedBy: officerId,
          role,
          previousStatus: PLANTATION_STATUS.BLOCKCHAIN_CONFIRMED,
          newStatus: plantation.status,
          details: { txHash: mintResult.transactionHash, amount: carbonCalc.tokens },
        });
      } else {
        console.error(`Token minting failed for ${plantation.plantationId}: ${mintResult?.error}`);
        await AuditLog.create({
          plantationId: plantation._id,
          action: 'token_minting_failed',
          performedBy: officerId,
          role,
          details: { error: mintResult?.error || 'Unknown minting error' },
        });
      }
    } catch (mintError) {
      console.error(`Unexpected minting error for ${plantation.plantationId}:`, mintError);
    }
  }

  // 4. Email Notification
  if (plantation.userId?.email) {
    sendPlantationStatusEmail(
      plantation.userId.email, 
      plantation.userId.name || 'Land Owner', 
      plantation.plantationId, 
      'approved', 
      {
        co2eq: carbonCalc.co2eq,
        tokens: carbonCalc.tokens,
        txHash: plantation.tokenTxHash,
      }
    ).catch(() => {});
  }

  return plantation;
}
