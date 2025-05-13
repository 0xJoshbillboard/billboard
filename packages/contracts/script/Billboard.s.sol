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
        // Get the deployer address from the private key
        address deployer = vm.addr(vm.envUint("PRIVATE_KEY"));
        console.log("Deployer address:", deployer);

        vm.startBroadcast();

        USDCMock usdc = new USDCMock();
        console.log("USDC Mock deployed at:", address(usdc));

        // Mint USDC to the deployer
        usdc.mint(deployer, 10000e6);

        // Deploy the BillboardGovernance
        BillboardGovernance governance = new BillboardGovernance();
        console.log("Billboard Governance deployed at:", address(governance));

        // Deploy the BillboardGovernanceProxy
        BillboardGovernanceProxy governanceProxy = new BillboardGovernanceProxy(address(governance), deployer, "");
        console.log("Billboard Governance Proxy deployed at:", address(governanceProxy));

        // Deploy the BillboardToken
        BillboardToken token = new BillboardToken(address(usdc));
        console.log("Billboard Token deployed at:", address(token));

        // Initialize the BillboardGovernanceProxy
        BillboardGovernance(address(governanceProxy)).initialize(
            30 days, 1000e6, 1000e6, address(token), 500e6, 1000e18, 1000e18
        );
        console.log("Billboard Governance Proxy initialized with values");

        // Deploy the BillboardRegistry
        BillboardRegistry registry = new BillboardRegistry();
        console.log("Billboard Registry deployed at:", address(registry));

        // Deploy the BillboardProxy with the implementation address
        BillboardProxy proxy = new BillboardProxy(address(registry), deployer, "");
        console.log("Billboard Proxy deployed at:", address(proxy));

        // Initialize the proxy with the registry address
        BillboardRegistry(address(proxy)).initialize(address(usdc), address(governanceProxy));
        console.log("Billboard Proxy initialized with registry");

        BillboardRegistry(address(proxy)).setGovernance(address(governanceProxy));
        console.log("Billboard Proxy initialized with governance");

        vm.stopBroadcast();
    }
}
