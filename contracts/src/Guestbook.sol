// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @notice A local teaching app, adapted from the Academy's Week 3 Guestbook.
/// @dev Anyone can replace the message. No funds, tokens or personal data needed.
contract Guestbook {
    error EmptyMessage();
    error MessageTooLong(uint256 length, uint256 maxLength);

    uint256 public constant MAX_LENGTH = 140;
    string public message;
    address public lastVisitor;
    uint256 public visitCount;

    event MessageChanged(address indexed visitor, string newMessage);

    constructor(string memory initialMessage) {
        _validate(initialMessage);
        message = initialMessage;
    }

    function setMessage(string calldata newMessage) external {
        _validate(newMessage);
        message = newMessage;
        lastVisitor = msg.sender;
        visitCount += 1;
        emit MessageChanged(msg.sender, newMessage);
    }

    function getMessage() external view returns (string memory) {
        return message;
    }

    function _validate(string memory text) private pure {
        uint256 length = bytes(text).length;
        if (length == 0) revert EmptyMessage();
        if (length > MAX_LENGTH) revert MessageTooLong(length, MAX_LENGTH);
    }
}
