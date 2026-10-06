// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @notice Each account manages its own short record; the owner can remove one.
contract Registry {
    error EmptyRecord();
    error RecordTooLong();
    error NotOwner();

    address public immutable owner;
    mapping(address => string) public records;
    event RecordUpdated(address indexed account, string value);

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
}
