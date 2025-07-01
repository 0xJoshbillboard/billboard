// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/BillboardGovernance.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

contract UpgradeGovernance is Script {
    address PROXY_ADDRESS = address(0x1875986B556048742C4597165510F19e9FDb42Fc);
    address PROXY_ADMIN = address(0x034600CB0a9967181b40D41AEBBDAe93F85eDE4B);

    function run() public {
        require(PROXY_ADDRESS != address(0), "Please set the proxy address");
        require(PROXY_ADMIN != address(0), "Please set the proxy admin address");

        // Get the private key from the environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        BillboardGovernance newImplementation = new BillboardGovernance();
        console.log("New Billboard Governance implementation deployed at:", address(newImplementation));

        ProxyAdmin admin = ProxyAdmin(PROXY_ADMIN);
        admin.upgradeAndCall(ITransparentUpgradeableProxy(PROXY_ADDRESS), address(newImplementation), "");
        console.log("Proxy upgraded to new implementation");

        vm.stopBroadcast();
    }
}

contract UpdateSecurityDepositForProposal is Script {
    address PROXY_ADDRESS = address(0x1875986B556048742C4597165510F19e9FDb42Fc);

    function run() public {
        // Get the private key from the environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        BillboardGovernance governance = BillboardGovernance(PROXY_ADDRESS);
        governance.updateSecurityDepositForProposal(1000 * 10 ** 18);
        vm.stopBroadcast();
    }
}

contract GetProxyAdmin is Script {
    function run() public view {
        bytes32 ADMIN_SLOT = 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;

        address proxyAddress = address(0x1875986B556048742C4597165510F19e9FDb42Fc);
        require(proxyAddress != address(0), "Please set the proxy address");

        bytes32 adminSlot = vm.load(proxyAddress, ADMIN_SLOT);
        address admin = address(uint160(uint256(adminSlot)));

        console.log("Proxy Admin address:", admin);
    }
}
