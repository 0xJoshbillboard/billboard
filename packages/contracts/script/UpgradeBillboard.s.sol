// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/BillboardRegistry.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

contract UpgradeBillboard is Script {
    address PROXY_ADDRESS = address(0xeD6725010B662BccCcEC3Cb1cCe83855809c1Cc4);
    address PROXY_ADMIN = address(0xc43629a84536A4957F76f12e23dFd093C38B7827);

    function run() public {
        require(PROXY_ADDRESS != address(0), "Please set the proxy address");
        require(PROXY_ADMIN != address(0), "Please set the proxy admin address");

        vm.startBroadcast();

        BillboardRegistry newImplementation = new BillboardRegistry();
        console.log("New Billboard Registry implementation deployed at:", address(newImplementation));

        ProxyAdmin admin = ProxyAdmin(PROXY_ADMIN);
        admin.upgradeAndCall(ITransparentUpgradeableProxy(PROXY_ADDRESS), address(newImplementation), "");
        console.log("Proxy upgraded to new implementation");

        vm.stopBroadcast();
    }
}

contract VerifyBillboard is Script {
    function run() public view {
        address proxyAddress = address(0xeD6725010B662BccCcEC3Cb1cCe83855809c1Cc4);
        require(proxyAddress != address(0), "Please set the proxy address");

        bytes32 IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
        bytes32 implementationSlot = vm.load(proxyAddress, IMPLEMENTATION_SLOT);
        address implementation = address(uint160(uint256(implementationSlot)));

        console.log("Current implementation address:", implementation);

        BillboardRegistry billboard = BillboardRegistry(proxyAddress);
        address usdc = address(billboard.usdc());
        address governance = address(billboard.governance());

        console.log("USDC address:", usdc);
        console.log("Governance address:", governance);
    }
}

contract GetProxyAdmin is Script {
    function run() public view {
        bytes32 ADMIN_SLOT = 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;

        address proxyAddress = address(0xeD6725010B662BccCcEC3Cb1cCe83855809c1Cc4);
        require(proxyAddress != address(0), "Please set the proxy address");

        bytes32 adminSlot = vm.load(proxyAddress, ADMIN_SLOT);
        address admin = address(uint160(uint256(adminSlot)));

        console.log("Proxy Admin address:", admin);
    }
}
