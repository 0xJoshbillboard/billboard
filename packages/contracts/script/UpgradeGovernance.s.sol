// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/BillboardGovernance.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

contract UpgradeGovernance is Script {
    // Update these addresses for the network you're deploying to
    address PROXY_ADDRESS = vm.envAddress("PROXY_ADDRESS");
    address PROXY_ADMIN = vm.envAddress("PROXY_ADMIN");

    function run() public {
        require(PROXY_ADDRESS != address(0), "Please set the proxy address");
        require(PROXY_ADMIN != address(0), "Please set the proxy admin address");

        vm.startBroadcast();

        // Deploy new implementation
        BillboardGovernance newImplementation = new BillboardGovernance();
        console.log("New Billboard Governance implementation deployed at:", address(newImplementation));

        // Upgrade proxy to use new implementation
        ProxyAdmin admin = ProxyAdmin(PROXY_ADMIN);
        admin.upgradeAndCall(
            ITransparentUpgradeableProxy(PROXY_ADDRESS),
            address(newImplementation),
            ""
        );
        console.log("Proxy upgraded to new implementation");

        vm.stopBroadcast();
    }
}

// Helper script to get the proxy admin address from a proxy contract
contract GetProxyAdmin is Script {
    function run() public view {
        // The storage slot for the admin address in TransparentUpgradeableProxy
        bytes32 ADMIN_SLOT = 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;
        
        address proxyAddress = vm.envAddress("PROXY_ADDRESS");
        require(proxyAddress != address(0), "Please set the proxy address");

        bytes32 adminSlot = vm.load(proxyAddress, ADMIN_SLOT);
        address admin = address(uint160(uint256(adminSlot)));
        
        console.log("Proxy Admin address:", admin);
    }
} 