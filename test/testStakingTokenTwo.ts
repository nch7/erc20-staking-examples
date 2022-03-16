import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract, logger, Wallet } from "ethers";
import { ethers } from "hardhat";

describe("StakingTokenTwo", function () {
  let stakingTokenTwo: Contract;
  let owner: SignerWithAddress;
  let account1: SignerWithAddress;
  let one = BigNumber.from(10).pow(18)

  beforeEach(async () => {
    const StakingTokenOne = await ethers.getContractFactory("StakingTokenTwo");
    [owner, account1] = await ethers.getSigners()
    stakingTokenTwo = await StakingTokenOne.deploy(1000);
    stakingTokenTwo.transfer(account1.address, one.mul(10));
  })

  it("should be able to stake", async function () {
    await stakingTokenTwo.connect(account1).stake(one.mul(5));
    const stakedBalance = await stakingTokenTwo.getStakedBalanceOf(account1.address);
    expect(stakedBalance).to.eq(one.mul(5));
  });

  it("should be able to unstake", async function () {
    expect(await stakingTokenTwo.balanceOf(account1.address)).to.eq(one.mul(10));
    await stakingTokenTwo.connect(account1).stake(one.mul(5));
    expect(await stakingTokenTwo.balanceOf(account1.address)).to.eq(one.mul(5));
    await stakingTokenTwo.connect(account1).unstake(one.mul(5));
    expect(await stakingTokenTwo.balanceOf(account1.address)).to.eq(one.mul(10));
  });

  it("should be able to see rewards", async function () {
    await stakingTokenTwo.connect(account1).stake(one.mul(5));
    expect(await stakingTokenTwo.connect(account1).getStakedBalanceOf(account1.address)).to.eq(one.mul(5));
    await stakingTokenTwo.hourlyRewardsDistribution();
    expect(await stakingTokenTwo.connect(account1).getStakedBalanceOf(account1.address)).to.eq(one.mul(5).add(5000));
  });

});
