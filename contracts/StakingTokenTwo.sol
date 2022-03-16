//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StakingTokenTwo is ERC20 {
    uint256 private rewardsPerHour;
    address private owner;

    mapping(address => uint256) private stakes;
    mapping(address => uint256) private rewards;
    mapping(address => bool) private isStakeHolder;
    address[] private stakeholders;

    constructor(uint256 _rewardsPerHour) ERC20("StakingTokenOne", "STO") {
        _mint(msg.sender, 100 * (10**18));
        rewardsPerHour = _rewardsPerHour;
        owner = msg.sender;
    }

    function stake(uint256 _amount) public {
        if (isStakeHolder[msg.sender] == false) {
            isStakeHolder[msg.sender] = true;
            stakeholders.push(msg.sender);
        }
        _burn(msg.sender, _amount);
        stakes[msg.sender] = stakes[msg.sender] + _amount;
    }

    function unstake(uint256 _amount) public {
        require(
            _amount >= getStakedBalanceOf(msg.sender),
            "insufficient staked balance"
        );
        _mint(msg.sender, _amount);
        if (_amount > rewards[msg.sender]) {
            stakes[msg.sender] =
                stakes[msg.sender] -
                (_amount - rewards[msg.sender]);
            rewards[msg.sender] = 0;
        } else {
            rewards[msg.sender] = rewards[msg.sender] - _amount;
        }
        if (stakes[msg.sender] == 0) {
            for (uint256 index = 0; index < stakeholders.length; index++) {
                if (stakeholders[index] == msg.sender) {
                    stakeholders[index] = stakeholders[stakeholders.length - 1];
                    stakeholders.pop();
                    break;
                }
            }
            isStakeHolder[msg.sender] = false;
        }
    }

    function getStakedBalanceOf(address _owner) public view returns (uint256) {
        return stakes[_owner] + rewards[_owner];
    }

    function hourlyRewardsDistribution() public {
        require(msg.sender == owner, "only admin can call this method");
        for (uint256 index = 0; index < stakeholders.length; index++) {
            rewards[stakeholders[index]] =
                rewards[stakeholders[index]] +
                (stakes[stakeholders[index]] / (10**decimals())) *
                rewardsPerHour;
        }
    }
}
