// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./mocks/USDCMock.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./BillboardGovernance.sol";

contract BillboardRegistry is Initializable, OwnableUpgradeable {
    USDCMock public usdc;
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
        string hash;
    }

    event BillboardPurchased(address indexed buyer, uint256 expiryTime, string description, string link, string hash);

    event BillboardExtended(address indexed owner, uint256 index, uint256 newExpiryTime);

    event BillboardAdvertiserRegistered(address indexed advertiser, string handle);

    event SecurityDepositWithdrawn(address indexed advertiser, uint256 amount);

    modifier onlyNewAdvertiser() {
        require(address(governance) != address(0), "Governance not initialized");
        Advertiser storage advertiser = advertisers[msg.sender];
        require(bytes(advertiser.handle).length == 0, "Advertiser already registered");
        _;
    }

    modifier onlyBillboardOwner(uint256 index) {
        require(address(governance) != address(0), "Governance not initialized");
        Billboard storage billboard = billboards[msg.sender][index];
        require(billboard.owner == msg.sender, "Not billboard owner");
        _;
    }

    function initialize(address _usdcAddress, address _governance) public initializer {
        __Ownable_init(msg.sender);
        require(_usdcAddress != address(0), "USDC address cannot be zero");
        require(_governance != address(0), "Governance address cannot be zero");
        usdc = USDCMock(_usdcAddress);
        governance = BillboardGovernance(_governance);
    }

    function setGovernance(address _governance) external onlyOwner {
        require(_governance != address(0), "Governance address cannot be zero");
        governance = BillboardGovernance(_governance);
    }

    function purchaseBillboard(
        string memory description,
        string memory link,
        string memory hash,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(address(governance) != address(0), "Governance not initialized");

        uint256 amount = governance.pricePerBillboard();
        usdc.permit(msg.sender, address(this), amount, deadline, v, r, s);

        require(usdc.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");

        billboards[msg.sender].push(
            Billboard({
                owner: msg.sender,
                expiryTime: block.timestamp + governance.duration(),
                description: description,
                link: link,
                hash: hash
            })
        );
        emit BillboardPurchased(msg.sender, block.timestamp + governance.duration(), description, link, hash);
    }

    function purchaseBillboardApprove(string memory description, string memory link, string memory hash) external {
        require(address(governance) != address(0), "Governance not initialized");

        require(usdc.transferFrom(msg.sender, address(this), governance.pricePerBillboard()), "USDC transfer failed");

        billboards[msg.sender].push(
            Billboard({
                owner: msg.sender,
                expiryTime: block.timestamp + governance.duration(),
                description: description,
                link: link,
                hash: hash
            })
        );
        emit BillboardPurchased(msg.sender, block.timestamp + governance.duration(), description, link, hash);
    }

    function extendBillboard(uint256 index, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
        external
        onlyBillboardOwner(index)
    {
        uint256 amount = governance.pricePerBillboard();
        usdc.permit(msg.sender, address(this), amount, deadline, v, r, s);
        require(usdc.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");

        billboards[msg.sender][index].expiryTime = block.timestamp + governance.duration();
        emit BillboardExtended(msg.sender, index, block.timestamp + governance.duration());
    }

    function extendBillboardApprove(uint256 index) external onlyBillboardOwner(index) {
        uint256 amount = governance.pricePerBillboard();
        require(usdc.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");

        billboards[msg.sender][index].expiryTime = block.timestamp + governance.duration();
        emit BillboardExtended(msg.sender, index, block.timestamp + governance.duration());
    }

    function registerBillboardAdvertiser(string memory handle, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
        external
        onlyNewAdvertiser
    {
        uint256 requiredDeposit = governance.securityDepositAdvertiser();
        usdc.permit(msg.sender, address(this), requiredDeposit, deadline, v, r, s);
        require(usdc.transferFrom(msg.sender, address(this), requiredDeposit), "USDC transfer failed");

        createAdvertiser(handle);
    }

    function registerBillboardAdvertiserApprove(string memory handle) external onlyNewAdvertiser {
        uint256 requiredDeposit = governance.securityDepositAdvertiser();
        require(usdc.transferFrom(msg.sender, address(this), requiredDeposit), "USDC transfer failed");

        createAdvertiser(handle);
    }

    function createAdvertiser(string memory handle) private {
        advertisers[msg.sender] =
            Advertiser({handle: handle, advertiser: msg.sender, depositTime: block.timestamp, withdrawnDeposit: false});
        emit BillboardAdvertiserRegistered(msg.sender, handle);
    }

    function withdrawSecurityDepositForAdvertiser() external {
        require(address(governance) != address(0), "Governance not initialized");
        Advertiser storage advertiser = advertisers[msg.sender];
        require(bytes(advertiser.handle).length > 0, "Not a registered advertiser");
        require(!advertiser.withdrawnDeposit, "Deposit already withdrawn");
        require(block.timestamp >= advertiser.depositTime + 30 days, "Deposit locked for 30 days");
        require(!governance.getAdvertiserIsBlamed(advertiser.advertiser).isBlamed, "Advertiser is blamed");
        uint256 depositAmount = governance.securityDepositAdvertiser();
        advertiser.withdrawnDeposit = true;
        require(usdc.transfer(msg.sender, depositAmount), "USDC transfer failed");
        emit SecurityDepositWithdrawn(msg.sender, depositAmount);
    }

    function getBillboards(address owner) external view returns (Billboard[] memory) {
        return billboards[owner];
    }

    function getBillboardAdvertiser(address advertiser) external view returns (Advertiser memory) {
        return advertisers[advertiser];
    }

    function withdrawFunds(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(IERC20(token).transfer(owner(), balance), "Transfer failed");
    }
}
