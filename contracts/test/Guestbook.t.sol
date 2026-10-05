// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Guestbook} from "../src/Guestbook.sol";
import {Test} from "forge-std/Test.sol";

contract GuestbookTest is Test {
    Guestbook book;
    event MessageChanged(address indexed visitor, string newMessage);

    function setUp() public {
        book = new Guestbook("Hello from NTU Blockchain Builder Lab");
    }

    function testInitialState() public view {
        require(keccak256(bytes(book.message())) == keccak256("Hello from NTU Blockchain Builder Lab"));
        require(book.lastVisitor() == address(0));
        require(book.visitCount() == 0);
    }

    function testWriteUpdatesAllStateAndEmitsEvent() public {
        address visitor = address(0xA11CE);
        vm.expectEmit(true, false, false, true, address(book));
        emit MessageChanged(visitor, "Hello from NTU Blockchain Builder Lab");
        vm.prank(visitor);
        book.setMessage("Hello from NTU Blockchain Builder Lab");
        require(keccak256(bytes(book.getMessage())) == keccak256("Hello from NTU Blockchain Builder Lab"));
        require(book.lastVisitor() == visitor);
        require(book.visitCount() == 1);
    }

    function testEmptyMessageRevertsAndPreservesState() public {
        vm.expectRevert(abi.encodeWithSelector(Guestbook.EmptyMessage.selector));
        book.setMessage("");
        require(book.visitCount() == 0);
        require(keccak256(bytes(book.message())) == keccak256("Hello from NTU Blockchain Builder Lab"));
    }

    function testBoundary140BytesAccepted() public {
        book.setMessage(string(new bytes(140)));
        require(bytes(book.message()).length == 140);
    }

    function testBoundary141BytesRejected() public {
        vm.expectRevert(abi.encodeWithSelector(Guestbook.MessageTooLong.selector, 141, 140));
        book.setMessage(string(new bytes(141)));
    }

    function testUtf8LimitUsesBytes() public {
        string memory text;
        for (uint256 i; i < 47; ++i) {
            text = string.concat(text, unicode"你");
        }
        vm.expectRevert(abi.encodeWithSelector(Guestbook.MessageTooLong.selector, 141, 140));
        book.setMessage(text);
    }

    function testConstructorRejectsEmptyMessage() public {
        vm.expectRevert(abi.encodeWithSelector(Guestbook.EmptyMessage.selector));
        new Guestbook("");
    }

    function testConstructorRejectsLongMessage() public {
        vm.expectRevert(abi.encodeWithSelector(Guestbook.MessageTooLong.selector, 141, 140));
        new Guestbook(string(new bytes(141)));
    }

    function testRepeatedMessagesStillCountTransactions() public {
        book.setMessage("Same");
        book.setMessage("Same");
        require(book.visitCount() == 2);
    }

    function testFuzzValidMessagesRoundTrip(string memory text) public {
        if (bytes(text).length == 0 || bytes(text).length > 140) return;
        book.setMessage(text);
        require(keccak256(bytes(book.message())) == keccak256(bytes(text)));
        require(book.visitCount() == 1);
    }
}
