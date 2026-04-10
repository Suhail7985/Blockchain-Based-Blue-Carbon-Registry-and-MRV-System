/**
 * Blockchain Layer - Polygon Amoy testnet
 * Backend handles all contract interactions using ethers.js.
 * NCCR wallet (owner) registers plantation hashes and mints BCC tokens.
 */
import { ethers } from 'ethers';
import crypto from 'crypto';

const AMOY_RPC = process.env.POLYGON_AMOY_RPC_URL || process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';
const CHAIN_ID = 80002; // Polygon Amoy
const EXPLORER_URL = 'https://amoy.polygonscan.com';

let provider = null;
let wallet = null;
let registryContract = null;
let tokenContract = null;
let marketplaceContract = null;

function getProvider() {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(AMOY_RPC);
  }
  return provider;
}

function getWallet() {
  const pk = process.env.NCCR_WALLET_PRIVATE_KEY;
  if (!pk) {
    throw new Error('NCCR_WALLET_PRIVATE_KEY is not set. Required for blockchain operations.');
  }
  if (!wallet) {
    wallet = new ethers.Wallet(pk.trim(), getProvider());
  }
  return wallet;
}

function getRegistryContract() {
  const addr = process.env.PLANTATION_REGISTRY_ADDRESS;
  if (!addr) {
    throw new Error('PLANTATION_REGISTRY_ADDRESS is not set.');
  }
  if (!registryContract) {
    const abi = [
      'function registerPlantation(bytes32 plantationIdHash, address ownerAddress, bytes32 dataHash) external',
      'function getRecord(bytes32 plantationIdHash) external view returns (address ownerAddress, bytes32 dataHash, uint256 timestamp, bool exists)',
      'event PlantationRecordStored(bytes32 indexed plantationIdHash, address indexed ownerAddress, bytes32 dataHash, uint256 timestamp)',
    ];
    registryContract = new ethers.Contract(addr, abi, getWallet());
  }
  return registryContract;
}

function getTokenContract() {
  const addr = process.env.CARBON_CREDIT_TOKEN_ADDRESS;
  if (!addr) {
    throw new Error('CARBON_CREDIT_TOKEN_ADDRESS is not set.');
  }
  if (!tokenContract) {
    const abi = [
      'function mint(address to, uint256 amount) external',
      'function balanceOf(address account) external view returns (uint256)',
      'function decimals() external view returns (uint8)',
      'function burn(uint256 amount) external',
      'function approve(address spender, uint256 amount) external returns (bool)',
      'function allowance(address owner, address spender) external view returns (uint256)',
    ];
    tokenContract = new ethers.Contract(addr, abi, getWallet());
  }
  return tokenContract;
}

function getMarketplaceContract() {
  const addr = process.env.CARBON_MARKETPLACE_ADDRESS;
  if (!addr) {
    throw new Error('CARBON_MARKETPLACE_ADDRESS is not set.');
  }
  if (!marketplaceContract) {
    const abi = [
      'function nextListingId() external view returns (uint256)',
      'function listings(uint256) external view returns (uint256 id, address seller, address tokenAddress, uint256 amount, uint256 pricePerToken, bool isActive)',
      'function listCredits(address tokenAddress, uint256 amount, uint256 pricePerToken) external',
      'function buyCredits(uint256 listingId) external payable',
      'function cancelListing(uint256 listingId) external',
      'event CreditsListed(uint256 indexed listingId, address indexed seller, uint256 amount, uint256 pricePerToken)',
      'event CreditsPurchased(uint256 indexed listingId, address indexed buyer, address indexed seller, uint256 amount, uint256 totalPrice)',
    ];
    marketplaceContract = new ethers.Contract(addr, abi, getWallet());
  }
  return marketplaceContract;
}

/**
 * Generate SHA-256 hash of plantation data (hex string).
 * Used for on-chain dataHash.
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

/**
 * Check if blockchain is configured (optional; returns false if env not set).
 */
export function isBlockchainConfigured() {
  return !!(
    process.env.NCCR_WALLET_PRIVATE_KEY &&
    process.env.PLANTATION_REGISTRY_ADDRESS &&
    process.env.CARBON_CREDIT_TOKEN_ADDRESS &&
    process.env.CARBON_MARKETPLACE_ADDRESS
  );
}

/**
 * Store plantation record on-chain. Only NCCR (owner) can call.
 * @param {string} plantationId - e.g. BCR-PLT-xxx
 * @param {string} ownerAddress - User wallet (0x...)
 * @param {string} dataHashHex - SHA-256 hash as 64-char hex (no 0x)
 * @returns {Promise<{ success, transactionHash, blockNumber, gasUsed }>}
 */
export async function storePlantationHash(plantationId, ownerAddress, dataHashHex) {
  if (!isBlockchainConfigured()) {
    return {
      success: false,
      error: 'Blockchain not configured',
      transactionHash: null,
      blockNumber: null,
      gasUsed: null,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const registry = getRegistryContract();
    const plantationIdHash = ethers.keccak256(ethers.toUtf8Bytes(plantationId));
    const dataHash = '0x' + String(dataHashHex).replace(/^0x/, '').padStart(64, '0').slice(-64);

    const tx = await registry.registerPlantation(plantationIdHash, ownerAddress, dataHash);
    const receipt = await tx.wait();

    return {
      success: !!receipt && receipt.status === 1,
      transactionHash: receipt?.hash || tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      gasUsed: receipt?.gasUsed?.toString() ?? null,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error('[blockchainService] storePlantationHash error:', err.message);
    return {
      success: false,
      error: err.message,
      transactionHash: null,
      blockNumber: null,
      gasUsed: null,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Mint BCC tokens to user. 1 token = 1 ton CO2eq; token uses 18 decimals.
 * @param {string} toAddress - User wallet (0x...)
 * @param {number} amountTokens - Human-readable tokens (e.g. 0.5)
 * @param {string} _plantationId - For logging only
 */
export async function mintCarbonToken(toAddress, amountTokens, _plantationId) {
  if (!isBlockchainConfigured()) {
    return {
      success: false,
      error: 'Blockchain not configured',
      transactionHash: null,
      amount: amountTokens,
    };
  }

  if (!toAddress || toAddress === ethers.ZeroAddress) {
    return {
      success: false,
      error: 'Invalid wallet address',
      transactionHash: null,
      amount: amountTokens,
    };
  }

  try {
    const token = getTokenContract();
    const amountWei = ethers.parseUnits(Number(amountTokens).toFixed(18), 18);
    const tx = await token.mint(toAddress, amountWei);
    const receipt = await tx.wait();

    return {
      success: !!receipt && receipt.status === 1,
      transactionHash: receipt?.hash || tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      gasUsed: receipt?.gasUsed?.toString() ?? null,
      amount: amountTokens,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error('[blockchainService] mintCarbonToken error:', err.message);
    return {
      success: false,
      error: err.message,
      transactionHash: null,
      amount: amountTokens,
    };
  }
}

/** Backwards-compatible alias */
export async function submitHashToBlockchain(hash, metadata = {}) {
  const plantationId = metadata.plantationId;
  const ownerAddress = metadata.ownerAddress;
  if (!plantationId || !ownerAddress) {
    return { success: false, transactionHash: null };
  }
  const result = await storePlantationHash(plantationId, ownerAddress, hash);
  return { success: result.success, transactionHash: result.transactionHash };
}

/**
 * Get BCC token balance for an address (read-only).
 */
export async function getTokenBalance(address) {
  if (!isBlockchainConfigured() || !address || address === ethers.ZeroAddress) {
    return null;
  }
  try {
    const token = getTokenContract();
    const balance = await token.balanceOf(address);
    return ethers.formatUnits(balance, 18);
  } catch (err) {
    console.error('[blockchainService] getTokenBalance error:', err.message);
    return null;
  }
}

export function getExplorerTxUrl(txHash) {
  if (!txHash) return null;
  return `${EXPLORER_URL}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address) {
  if (!address) return null;
  return `${EXPLORER_URL}/address/${address}`;
}

/**
 * Fetch all active listings from the Carbon Marketplace.
 */
export async function getMarketplaceListings() {
  if (!isBlockchainConfigured()) return [];
  try {
    const marketplace = getMarketplaceContract();
    const nextId = await marketplace.nextListingId();
    const count = Number(nextId);
    const activeListings = [];

    for (let i = 0; i < count; i++) {
        const l = await marketplace.listings(i);
        if (l.isActive) {
            activeListings.push({
                listingId: Number(l.id),
                seller: l.seller,
                tokenAddress: l.tokenAddress,
                amount: ethers.formatUnits(l.amount, 18),
                pricePerToken: ethers.formatEther(l.pricePerToken),
                totalPrice: ethers.formatEther(l.amount * l.pricePerToken)
            });
        }
    }
    return activeListings;
  } catch (err) {
    console.error('[blockchainService] getMarketplaceListings error:', err.message);
    return [];
  }
}
