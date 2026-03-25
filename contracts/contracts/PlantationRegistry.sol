// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PlantationRegistry
 * @dev Stores plantation record hashes on-chain for MRV transparency.
 * Only NCCR (owner) can register. Backend calls this after verification.
 */
contract PlantationRegistry is Ownable {
    struct PlantationRecord {
        bytes32 plantationIdHash;
        address ownerAddress;
        bytes32 dataHash;
        uint256 timestamp;
        bool exists;
    }

    mapping(bytes32 => PlantationRecord) public records;
    bytes32[] public recordIds;
    mapping(bytes32 => uint256) public recordIdIndex;

    event PlantationRecordStored(
        bytes32 indexed plantationIdHash,
        address indexed ownerAddress,
        bytes32 dataHash,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Register a plantation record. Only callable by NCCR (owner).
     * @param plantationIdHash keccak256(plantationId) for uniqueness
     * @param ownerAddress Land owner wallet to receive tokens
     * @param dataHash SHA-256 hash of plantation data (off-chain)
     */
    function registerPlantation(
        bytes32 plantationIdHash,
        address ownerAddress,
        bytes32 dataHash
    ) external onlyOwner {
        require(ownerAddress != address(0), "Invalid owner");
        require(dataHash != bytes32(0), "Invalid hash");
        require(!records[plantationIdHash].exists, "Already registered");

        uint256 timestamp = block.timestamp;
        records[plantationIdHash] = PlantationRecord({
            plantationIdHash: plantationIdHash,
            ownerAddress: ownerAddress,
            dataHash: dataHash,
            timestamp: timestamp,
            exists: true
        });
        recordIds.push(plantationIdHash);
        recordIdIndex[plantationIdHash] = recordIds.length - 1;

        emit PlantationRecordStored(plantationIdHash, ownerAddress, dataHash, timestamp);
    }

    function getRecord(bytes32 plantationIdHash) external view returns (
        address ownerAddress,
        bytes32 dataHash,
        uint256 timestamp,
        bool exists
    ) {
        PlantationRecord memory r = records[plantationIdHash];
        return (r.ownerAddress, r.dataHash, r.timestamp, r.exists);
    }

    function getRecordCount() external view returns (uint256) {
        return recordIds.length;
    }
}
