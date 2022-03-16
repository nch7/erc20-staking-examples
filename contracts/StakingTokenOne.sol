//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract StakingTokenOne is ERC20 {
    uint256 private rewardsPerHour;

    struct Stake {
        address owner;
        uint256 initialStakedAmount;
        uint256 createdAt;
        bool withdrawn;
    }

    Stake[] internal stakes;

    constructor(uint256 _rewardsPerHour) ERC20("StakingTokenOne", "STO") {
        _mint(msg.sender, 100 * (10**18));
        rewardsPerHour = _rewardsPerHour;
    }

    function stake(uint256 _amount) public returns (uint256) {
        _burn(msg.sender, _amount);
        stakes.push(Stake(msg.sender, _amount, block.timestamp, false));
        return stakes.length;
    }

    function unstake(uint256 _index) public {
        require(
            stakes[_index].owner == msg.sender,
            "only stake owner can unstake"
        );
        require(
            stakes[_index].withdrawn == false,
            "this stake was already withdrawn"
        );
        _mint(msg.sender, getStakedBalanceOf(_index));
        stakes[_index].withdrawn = true;
    }

    function getStakedBalanceOf(uint256 _index) public view returns (uint256) {
        return
            stakes[_index].initialStakedAmount +
            (stakes[_index].initialStakedAmount / (10**decimals())) *
            rewardsPerHour *
            ((block.timestamp - stakes[_index].createdAt) / 3600);
    }
}
