// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/BillboardRegistry.sol";
import "../src/BillboardProxy.sol";
import "../src/BillboardGovernance.sol";
import "../src/BillboardGovernanceProxy.sol";
import "../src/mocks/USDCMock.sol";
import "../src/BillboardToken.sol";

contract DeployBillboard is Script {
    function run() public {
        vm.startBroadcast();

        USDCMock usdc = new USDCMock();
        console.log("USDC Mock deployed at:", address(usdc));

        usdc.mint(0xd0B19109DD194fe366f2d2dA34B3C22Dabb1Cb0b, 10000e6);

        // Deploy the BillboardGovernance
        BillboardGovernance governance = new BillboardGovernance();
        console.log("Billboard Governance deployed at:", address(governance));

        // Deploy the BillboardGovernanceProxy
        BillboardGovernanceProxy governanceProxy = new BillboardGovernanceProxy(address(governance), 0xd0B19109DD194fe366f2d2dA34B3C22Dabb1Cb0b, "");
        console.log("Billboard Governance Proxy deployed at:", address(governanceProxy));

      // Deploy the BillboardToken
        BillboardToken token = new BillboardToken(address(usdc));
        console.log("Billboard Token deployed at:", address(token));

        // Initialize the BillboardGovernanceProxy
        BillboardGovernance(address(governanceProxy)).initialize(30 days, 1000e6, 10000e6, address(token));
        console.log("Billboard Governance Proxy initialized with values");

        // Deploy the BillboardRegistry
        BillboardRegistry registry = new BillboardRegistry();
        console.log("Billboard Registry deployed at:", address(registry));

        // Deploy the BillboardProxy with the implementation address
        BillboardProxy proxy = new BillboardProxy(address(registry), 0xd0B19109DD194fe366f2d2dA34B3C22Dabb1Cb0b, "");
        console.log("Billboard Proxy deployed at:", address(proxy));

        // Initialize the proxy with the registry address
        BillboardRegistry(address(proxy)).initialize(address(usdc), address(governanceProxy));
        console.log("Billboard Proxy initialized with registry");

        vm.stopBroadcast();
    }
}
