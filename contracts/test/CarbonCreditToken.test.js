const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonCreditToken", function () {
  let token, owner, minter, user;

  beforeEach(async function () {
    [owner, minter, user] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("CarbonCreditToken");
    token = await Token.deploy();
    await token.deployed();
  });

  it("should have correct name and symbol", async function () {
    expect(await token.name()).to.equal("Blue Carbon Credit");
    expect(await token.symbol()).to.equal("BCC");
  });

  it("owner should have admin and minter roles", async function () {
    expect(await token.hasRole(await token.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
    expect(await token.hasRole(await token.MINTER_ROLE(), owner.address)).to.be.true;
  });

  it("owner can add and remove minter", async function () {
    await token.addMinter(minter.address);
    expect(await token.hasRole(await token.MINTER_ROLE(), minter.address)).to.be.true;
    await token.removeMinter(minter.address);
    expect(await token.hasRole(await token.MINTER_ROLE(), minter.address)).to.be.false;
  });

  it("minter can mint tokens", async function () {
    await token.addMinter(minter.address);
    await token.connect(minter).mint(user.address, 1000);
    expect(await token.balanceOf(user.address)).to.equal(1000);
  });

  it("cannot mint to zero address", async function () {
    await expect(token.mint(ethers.constants.AddressZero, 1000)).to.be.revertedWith("Cannot mint to zero address");
  });

  it("user can burn their tokens", async function () {
    await token.mint(user.address, 500);
    await token.connect(user).burn(200);
    expect(await token.balanceOf(user.address)).to.equal(300);
  });

  it("owner can pause and unpause", async function () {
    await token.pause();
    await expect(token.transfer(user.address, 100)).to.be.revertedWith("Pausable: paused");
    await token.unpause();
    await token.mint(owner.address, 100);
    await token.transfer(user.address, 100);
    expect(await token.balanceOf(user.address)).to.equal(100);
  });
});
