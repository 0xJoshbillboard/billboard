// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/BillboardGovernance.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

contract UpgradeGovernance is Script {
    address PROXY_ADDRESS = address(0x6e5f0fc82f3402c12e8d304403661b7e1cdc5067);
    address PROXY_ADMIN = address(0x366CE779048AB65BFA009B2c0eb276d4F59f4149);

    function run() public {
        require(PROXY_ADDRESS != address(0), "Please set the proxy address");
        require(PROXY_ADMIN != address(0), "Please set the proxy admin address");

        vm.startBroadcast();

        BillboardGovernance newImplementation = new BillboardGovernance();
        console.log("New Billboard Governance implementation deployed at:", address(newImplementation));

        ProxyAdmin admin = ProxyAdmin(PROXY_ADMIN);
        admin.upgradeAndCall(ITransparentUpgradeableProxy(PROXY_ADDRESS), address(newImplementation), "");
        console.log("Proxy upgraded to new implementation");

        vm.stopBroadcast();
    }
}

contract GetProxyAdmin is Script {
    function run() public view {
        bytes32 ADMIN_SLOT = 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;

        address proxyAddress = address(0x6e5f0fc82f3402c12e8d304403661b7e1cdc5067);
        require(proxyAddress != address(0), "Please set the proxy address");

        bytes32 adminSlot = vm.load(proxyAddress, ADMIN_SLOT);
        address admin = address(uint160(uint256(adminSlot)));

        console.log("Proxy Admin address:", admin);
    }
}
