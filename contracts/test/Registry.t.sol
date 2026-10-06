// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {Registry} from "../src/Registry.sol";

contract RegistryTest is Test {
    Registry registry;
    address alice = address(0xA11CE);
    address bob = address(0xB0B);
    event RecordUpdated(address indexed account, string value);

    function setUp() public { registry = new Registry(); }

    function testInitialOwnerAndRecord() public view {
        assertEq(registry.owner(), address(this));
        assertEq(registry.records(address(this)), "Hello from NTU Blockchain Builder Lab");
    }

    function testWriteEmitsEventAndOnlyChangesCallersRecord() public {
        vm.expectEmit(true, false, false, true, address(registry));
        emit RecordUpdated(alice, "Hello");
        vm.prank(alice);
        registry.setRecord("Hello");
        vm.prank(bob);
        registry.setRecord("Bob's record");
        assertEq(registry.records(alice), "Hello");
        assertEq(registry.records(bob), "Bob's record");
    }

    function testEmptyRecordReverts() public {
        vm.expectRevert(Registry.EmptyRecord.selector);
        registry.setRecord("");
        assertEq(registry.records(address(this)), "Hello from NTU Blockchain Builder Lab");
    }

    function testByteBoundaries() public {
        registry.setRecord(string(new bytes(140)));
        assertEq(bytes(registry.records(address(this))).length, 140);
        vm.expectRevert(Registry.RecordTooLong.selector);
        registry.setRecord(string(new bytes(141)));
    }

    function testNonOwnerCannotClear() public {
        vm.prank(alice);
        vm.expectRevert(Registry.NotOwner.selector);
        registry.clearRecord(address(this));
        assertEq(registry.records(address(this)), "Hello from NTU Blockchain Builder Lab");
    }

    function testOwnerCanClearWithEvent() public {
        vm.prank(alice);
        registry.setRecord("Hello");
        vm.expectEmit(true, false, false, true, address(registry));
        emit RecordUpdated(alice, "");
        registry.clearRecord(alice);
        assertEq(registry.records(alice), "");
    }
}
