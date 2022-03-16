import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract, logger, Wallet } from "ethers";
import { ethers } from "hardhat";

describe("StakingTokenOne", function () {
  let stakingTokenOne: Contract;
  let owner: SignerWithAddress;
  let account1: SignerWithAddress;
  let one = BigNumber.from(10).pow(18)

  beforeEach(async () => {
    const StakingTokenOne = await ethers.getContractFactory("StakingTokenOne");
    [owner, account1] = await ethers.getSigners()
    stakingTokenOne = await StakingTokenOne.deploy(1000);

    stakingTokenOne.transfer(account1.address, one.mul(10));
  })

  it("should be able to stake", async function () {
    const stakeIndex = (await stakingTokenOne.connect(account1).stake(one.mul(5))).value;
    const stakedBalance = await stakingTokenOne.connect(account1).getStakedBalanceOf(stakeIndex);
    expect(stakedBalance).to.eq(one.mul(5));
  });

  it("should be able to unstake", async function () {
    expect(await stakingTokenOne.balanceOf(account1.address)).to.eq(one.mul(10));
    const stakeIndex = (await stakingTokenOne.connect(account1).stake(one.mul(5))).value;
    expect(await stakingTokenOne.balanceOf(account1.address)).to.eq(one.mul(5));
    await stakingTokenOne.connect(account1).unstake(stakeIndex);
    expect(await stakingTokenOne.balanceOf(account1.address)).to.eq(one.mul(10));
  });

  it("should be able to see rewards", async function () {
    const stakeIndex = (await stakingTokenOne.connect(account1).stake(one.mul(5))).value;
    expect(await stakingTokenOne.connect(account1).getStakedBalanceOf(stakeIndex)).to.eq(one.mul(5));
    await ethers.provider.send("evm_increaseTime", [3600]);
    await ethers.provider.send("evm_mine", []);
    expect(await stakingTokenOne.connect(account1).getStakedBalanceOf(stakeIndex)).to.eq(one.mul(5).add(5000));
  });

});
