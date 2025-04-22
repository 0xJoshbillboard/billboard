// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/BillboardToken.sol";

contract DeployBillboardToken is Script {
    function run() public {
        address usdcAddress = address(0x65046188900D3C1FE0c559983997267326a85D10);
        require(usdcAddress != address(0), "Please set the USDC address");

        vm.startBroadcast();

        BillboardToken token = new BillboardToken(usdcAddress);
        console.log("BillboardToken deployed at:", address(token));
        console.log("Total supply:", token.totalSupply());
        console.log("Token name:", token.name());
        console.log("Token symbol:", token.symbol());

        vm.stopBroadcast();
    }
} 