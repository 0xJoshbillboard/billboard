// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./BillboardGovernance.sol";

contract BillboardRegistry is Initializable, OwnableUpgradeable {
    IERC20 public usdc;
    BillboardGovernance public governance;

    mapping(address => Billboard[]) public billboards;
    mapping(address => string) public billboardProviders;
    mapping(address => uint256) public providerDepositTime;
    mapping(address => bool) public providerWithdrawnDeposit;

    struct Billboard {
        address owner;
        uint256 expiryTime;
        string description;
        string link;
        string ipfsHash;
    }

    event BillboardPurchased(
        address indexed buyer, uint256 expiryTime, string description, string link, string ipfsHash
    );

    event BillboardExtended(address indexed owner, uint256 index, uint256 newExpiryTime);

    event BillboardProviderRegistered(address indexed provider, string handle);

    event SecurityDepositWithdrawn(address indexed provider, uint256 amount);

    function initialize(address _usdcAddress, address _governance) public initializer {
        __Ownable_init(msg.sender);
        require(_usdcAddress != address(0), "USDC address cannot be zero");
        require(_governance != address(0), "Governance address cannot be zero");
        usdc = IERC20(_usdcAddress);
        governance = BillboardGovernance(_governance);
    }

    function purchaseBillboard(string memory description, string memory link, string memory ipfsHash) external {
        require(address(governance) != address(0), "Governance not initialized");
        require(usdc.transferFrom(msg.sender, address(this), governance.pricePerBillboard()), "USDC transfer failed");
        billboards[msg.sender].push(
            Billboard({
                owner: msg.sender,
                expiryTime: block.timestamp + governance.duration(),
                description: description,
                link: link,
                ipfsHash: ipfsHash
            })
        );
        emit BillboardPurchased(msg.sender, block.timestamp + governance.duration(), description, link, ipfsHash);
    }

    function getBillboards(address owner) external view returns (Billboard[] memory) {
        return billboards[owner];
    }

    function extendBillboard(uint256 index) external {
        require(address(governance) != address(0), "Governance not initialized");
        Billboard storage billboard = billboards[msg.sender][index];
        require(billboard.owner == msg.sender, "Not billboard owner");
        require(usdc.transferFrom(msg.sender, address(this), governance.pricePerBillboard()), "USDC transfer failed");
        billboard.expiryTime = block.timestamp + governance.duration();
        emit BillboardExtended(msg.sender, index, block.timestamp + governance.duration());
    }

    function registerBillboardProvider(string memory handle) external {
        require(address(governance) != address(0), "Governance not initialized");
        require(bytes(billboardProviders[msg.sender]).length == 0, "Provider already registered");
        require(usdc.transferFrom(msg.sender, address(this), governance.securityDeposit()), "USDC transfer failed");
        billboardProviders[msg.sender] = handle;
        providerDepositTime[msg.sender] = block.timestamp;
        providerWithdrawnDeposit[msg.sender] = false;
        emit BillboardProviderRegistered(msg.sender, handle);
    }

    function getBillboardProvider(address provider) external view returns (string memory) {
        return billboardProviders[provider];
    }

    function withdrawSecurityDeposit() external {
        require(address(governance) != address(0), "Governance not initialized");
        require(bytes(billboardProviders[msg.sender]).length > 0, "Not a registered provider");
        require(!providerWithdrawnDeposit[msg.sender], "Deposit already withdrawn");
        require(block.timestamp >= providerDepositTime[msg.sender] + 30 days, "Deposit locked for 30 days");
        uint256 depositAmount = governance.securityDeposit();
        providerWithdrawnDeposit[msg.sender] = true;
        require(usdc.transfer(msg.sender, depositAmount), "USDC transfer failed");
        emit SecurityDepositWithdrawn(msg.sender, depositAmount);
    }

    function withdrawFunds() external onlyOwner {
        uint256 balance = usdc.balanceOf(address(this));
        require(usdc.transfer(owner(), balance), "Transfer failed");
    }
}
