// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @notice Builder W6 Part 3 security lab.
/// @dev DELIBERATELY UNSAFE. This contract contains planted weaknesses for a
/// teaching exercise. Run it only in local Foundry tests. Never deploy it,
/// and never send it real funds.
contract TipRegistry {
    error EmptyRecord();
    error RecordTooLong();
    error NotOwner();
    error ZeroTip();
    error NothingToWithdraw();
    error TransferFailed();

    address public owner;
    mapping(address => string) public records;
    mapping(address => uint256) public tips;

    event RecordUpdated(address indexed account, string value);
    event Tipped(address indexed from, address indexed to, uint256 amount);
    event TipsWithdrawn(address indexed account, uint256 amount);
    event OwnerChanged(address indexed previousOwner, address indexed newOwner);

    constructor() {
        owner = msg.sender;
        records[msg.sender] = "Hello from NTU Blockchain Builder Lab";
        emit RecordUpdated(msg.sender, records[msg.sender]);
    }

    function setRecord(string calldata value) external {
        if (bytes(value).length == 0) revert EmptyRecord();
        if (bytes(value).length > 140) revert RecordTooLong();
        records[msg.sender] = value;
        emit RecordUpdated(msg.sender, value);
    }

    function clearRecord(address account) external {
        if (msg.sender != owner) revert NotOwner();
        delete records[account];
        emit RecordUpdated(account, "");
    }

    /// @notice Send test ETH to thank the author of a record.
    function tip(address account) external payable {
        if (msg.value == 0) revert ZeroTip();
        tips[account] += msg.value;
        emit Tipped(msg.sender, account, msg.value);
    }

    /// @notice Withdraw every tip you have received.
    function withdrawTips() external {
        uint256 amount = tips[msg.sender];
        if (amount == 0) revert NothingToWithdraw();

        (bool ok, ) = msg.sender.call{value: amount}("");
        if (!ok) revert TransferFailed();

        tips[msg.sender] = 0;
        emit TipsWithdrawn(msg.sender, amount);
    }

    /// @notice Hand the owner role to a new address.
    function transferOwnership(address newOwner) external {
        emit OwnerChanged(owner, newOwner);
        owner = newOwner;
    }
}
