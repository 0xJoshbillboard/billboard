// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/BillboardRegistry.sol";
import "../src/BillboardProxy.sol";
import "../src/BillboardGovernance.sol";
import "../src/BillboardGovernanceProxy.sol";
import "../src/mocks/USDCMock.sol";

contract DeployBillboard is Script {
    function run() public {
        vm.startBroadcast();

        USDCMock usdc = new USDCMock();
        console.log("USDC Mock deployed at:", address(usdc));

        usdc.mint(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, 10000e6);

        // Deploy the BillboardGovernance
        BillboardGovernance governance = new BillboardGovernance();
        console.log("Billboard Governance deployed at:", address(governance));

        // Deploy the BillboardGovernanceProxy
        BillboardGovernanceProxy governanceProxy = new BillboardGovernanceProxy(address(governance), address(this), "");
        console.log("Billboard Governance Proxy deployed at:", address(governanceProxy));

        // Initialize the BillboardGovernanceProxy
        BillboardGovernance(address(governanceProxy)).initialize(30 days, 1000e6, 10000e6, address(usdc));
        console.log("Billboard Governance Proxy initialized with values");

        // Deploy the BillboardRegistry
        BillboardRegistry registry = new BillboardRegistry();
        console.log("Billboard Registry deployed at:", address(registry));

        // Deploy the BillboardProxy with the implementation address
        BillboardProxy proxy = new BillboardProxy(address(registry), address(this), "");
        console.log("Billboard Proxy deployed at:", address(proxy));

        // Initialize the proxy with the registry address
        BillboardRegistry(address(proxy)).initialize(address(usdc), address(governanceProxy));
        console.log("Billboard Proxy initialized with registry");

        vm.stopBroadcast();
    }
}
