import crypto from 'crypto';

/**
 * Generate SHA-256 hash of plantation data for blockchain anchoring.
 * Used for: Plantation ID, Land ID, Tree Count, Area, Species, Timestamp
 */
export function generatePlantationHash(data) {
  const payload = [
    data.plantationId,
    data.landId?.toString?.() ?? '',
    String(data.treeCount),
    String(data.areaHectares),
    (data.speciesName || '').trim(),
    (data.timestamp || new Date()).toISOString(),
  ].join('|');
  return crypto.createHash('sha256').update(payload).digest('hex');
}

// ---- Blockchain provider stubs ----

export function connectProvider() {
  // In production, return an actual RPC provider or Web3 client.
  const rpcUrl = process.env.POLYGON_RPC_URL || 'https://rpc-amoy.polygon.technology';
  return { rpcUrl };
}

export async function getTransactionReceipt(txHash) {
  // Stubbed receipt – replace with real provider.getTransactionReceipt
  return {
    transactionHash: txHash,
    blockNumber: Math.floor(Math.random() * 1_000_000),
    gasUsed: 21000 + Math.floor(Math.random() * 10_000),
    timestamp: new Date().toISOString(),
    success: true,
  };
}

/**
 * Stub: Submit hash to Polygon blockchain. Replace with real RPC/contract call.
 * Returns mock transaction metadata for development.
 */
export async function storePlantationHash(hash, metadata = {}) {
  connectProvider(); // unused for now, but shows where provider wiring would go
  const mockTxHash = '0x' + crypto.randomBytes(32).toString('hex');
  const receipt = await getTransactionReceipt(mockTxHash);
  return {
    success: true,
    transactionHash: mockTxHash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed,
    timestamp: receipt.timestamp,
  };
}

// Backwards-compatible alias used by older code paths
export async function submitHashToBlockchain(hash, metadata = {}) {
  const result = await storePlantationHash(hash, metadata);
  return { success: result.success, transactionHash: result.transactionHash };
}

/**
 * Stub: Mint tokens to user wallet. Replace with real contract mint call.
 */
export async function mintTokensToWallet(walletAddress, amountTonCO2eq, plantationId) {
  // TODO: Call smart contract mint function
  const mockTxHash = '0x' + crypto.randomBytes(32).toString('hex');
  return { success: true, transactionHash: mockTxHash, amount: amountTonCO2eq };
}

// More explicit name for minting in the carbon context
export async function mintCarbonToken(walletAddress, amountTonCO2eq, plantationId) {
  return mintTokensToWallet(walletAddress, amountTonCO2eq, plantationId);
}
