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
    mapping(address => Advertiser) public advertisers;

    struct Advertiser {
        string handle;
        address advertiser;
        uint256 depositTime;
        bool withdrawnDeposit;
    }

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

    function setGovernance(address _governance) external onlyOwner {
        require(_governance != address(0), "Governance address cannot be zero");
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

    function registerBillboardAdvertiser(string memory handle) external {
        require(address(governance) != address(0), "Governance not initialized");
        Advertiser storage advertiser = advertisers[msg.sender];
        require(bytes(advertiser.handle).length == 0, "Provider already registered");
        require(
            usdc.transferFrom(msg.sender, address(this), governance.securityDepositProvider()), "USDC transfer failed"
        );
        advertiser.handle = handle;
        advertiser.advertiser = msg.sender;
        advertiser.depositTime = block.timestamp;
        advertiser.withdrawnDeposit = false;
        emit BillboardProviderRegistered(msg.sender, handle);
    }

    function getBillboardAdvertiser(address advertiser) external view returns (Advertiser memory) {
        return advertisers[advertiser];
    }

    function withdrawSecurityDepositForAdvertiser() external {
        require(address(governance) != address(0), "Governance not initialized");
        Advertiser storage advertiser = advertisers[msg.sender];
        require(bytes(advertiser.handle).length > 0, "Not a registered provider");
        require(!advertiser.withdrawnDeposit, "Deposit already withdrawn");
        require(block.timestamp >= advertiser.depositTime + 30 days, "Deposit locked for 30 days");
        require(!governance.getAdvertiserIsBlamed(advertiser.advertiser).isBlamed, "Advertiser is blamed");
        uint256 depositAmount = governance.securityDepositProvider();
        advertiser.withdrawnDeposit = true;
        require(usdc.transfer(msg.sender, depositAmount), "USDC transfer failed");
        emit SecurityDepositWithdrawn(msg.sender, depositAmount);
    }

    function withdrawFunds(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(IERC20(token).transfer(owner(), balance), "Transfer failed");
    }
}
