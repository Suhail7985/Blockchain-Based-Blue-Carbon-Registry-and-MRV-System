const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PlantationRegistry", function () {
  let registry, owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("PlantationRegistry");
    registry = await Registry.deploy();
    await registry.waitForDeployment();
  });

  it("should allow owner to register a plantation record", async function () {
    const plantationId = "BCR-PLT-ABC123";
    const plantationIdHash = ethers.keccak256(ethers.toUtf8Bytes(plantationId));
    const dataHash = ethers.keccak256(ethers.toUtf8Bytes("treeCount=100|area=10|species=Mangrove"));
    const ownerAddress = user.address;

    await expect(
      registry.connect(owner).registerPlantation(plantationIdHash, ownerAddress, dataHash)
    ).to.emit(registry, "PlantationRecordStored");

    const record = await registry.getRecord(plantationIdHash);
    expect(record[0]).to.equal(ownerAddress);
    expect(record[1]).to.equal(dataHash);
    expect(record[3]).to.be.true;
  });

  it("should reject registration by non-owner", async function () {
    const plantationIdHash = ethers.keccak256(ethers.toUtf8Bytes("BCR-PLT-X"));
    const dataHash = ethers.keccak256(ethers.toUtf8Bytes("data"));
    await expect(
      registry.connect(user).registerPlantation(plantationIdHash, user.address, dataHash)
    ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
  });

  it("should reject duplicate plantationIdHash", async function () {
    const plantationIdHash = ethers.keccak256(ethers.toUtf8Bytes("BCR-PLT-DUP"));
    const dataHash = ethers.keccak256(ethers.toUtf8Bytes("data"));
    await registry.connect(owner).registerPlantation(plantationIdHash, user.address, dataHash);
    await expect(
      registry.connect(owner).registerPlantation(plantationIdHash, user.address, dataHash)
    ).to.be.revertedWith("Already registered");
  });

  it("should return record count", async function () {
    expect(await registry.getRecordCount()).to.equal(0);
    const hash1 = ethers.keccak256(ethers.toUtf8Bytes("id1"));
    const dataHash = ethers.keccak256(ethers.toUtf8Bytes("data"));
    await registry.connect(owner).registerPlantation(hash1, user.address, dataHash);
    expect(await registry.getRecordCount()).to.equal(1);
  });
});
