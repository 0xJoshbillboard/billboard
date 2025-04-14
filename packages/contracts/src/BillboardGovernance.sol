// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract BillboardGovernance is Initializable, OwnableUpgradeable {
    uint256 public duration;
    uint256 public pricePerBillboard;
    uint256 public securityDeposit;

    function initialize(uint256 _duration, uint256 _pricePerBillboard, uint256 _securityDeposit) public initializer {
        __Ownable_init(msg.sender);
        duration = _duration;
        pricePerBillboard = _pricePerBillboard;
        securityDeposit = _securityDeposit;
    }

    function setDuration(uint256 _duration) public onlyOwner {
        duration = _duration;
    }

    function setPricePerBillboard(uint256 _pricePerBillboard) public onlyOwner {
        pricePerBillboard = _pricePerBillboard;
    }
}
