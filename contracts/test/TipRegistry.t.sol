// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {TipRegistry} from "../src/TipRegistry.sol";

/// Normal-use tests for the W6.3 lab. They all pass, which is the point of the
/// lab: passing tests only cover the behaviour someone thought to check.
contract TipRegistryTest is Test {
    TipRegistry registry;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    event Tipped(address indexed from, address indexed to, uint256 amount);

    function setUp() public {
        registry = new TipRegistry();
        vm.deal(alice, 10 ether);
    }

    function testTipIsCreditedToTheAuthor() public {
        vm.expectEmit(true, true, false, true, address(registry));
        emit Tipped(alice, bob, 1 ether);
        vm.prank(alice);
        registry.tip{value: 1 ether}(bob);
        assertEq(registry.tips(bob), 1 ether);
        assertEq(address(registry).balance, 1 ether);
    }

    function testZeroTipReverts() public {
        vm.expectRevert(TipRegistry.ZeroTip.selector);
        vm.prank(alice);
        registry.tip{value: 0}(bob);
    }

    function testAuthorCanWithdrawTheirTips() public {
        vm.prank(alice);
        registry.tip{value: 2 ether}(bob);
        vm.prank(bob);
        registry.withdrawTips();
        assertEq(bob.balance, 2 ether);
        assertEq(registry.tips(bob), 0);
    }

    function testWithdrawWithNoTipsReverts() public {
        vm.expectRevert(TipRegistry.NothingToWithdraw.selector);
        vm.prank(bob);
        registry.withdrawTips();
    }

    function testOwnerCanClearARecord() public {
        vm.prank(alice);
        registry.setRecord("hello");
        registry.clearRecord(alice);
        assertEq(registry.records(alice), "");
    }

    function testNonOwnerCannotClearARecord() public {
        vm.expectRevert(TipRegistry.NotOwner.selector);
        vm.prank(alice);
        registry.clearRecord(address(this));
    }
}
