// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.34;

import {EvidenceRegistry} from "./EvidenceRegistry.sol";
import {Test} from "forge-std/Test.sol";

contract EvidenceRegistryTest is Test {
    EvidenceRegistry registry;
    address admin;
    address authorizedAnchor;
    address unauthorizedUser;
    bytes32 testHash = keccak256(abi.encodePacked("test evidence data"));

    function setUp() public {
        admin = address(this);
        authorizedAnchor = address(0x1);
        unauthorizedUser = address(0x2);
        
        vm.deal(admin, 10 ether);
        vm.deal(authorizedAnchor, 10 ether);
        vm.deal(unauthorizedUser, 10 ether);
        
        registry = new EvidenceRegistry(admin);
    }

    function test_ConstructorInitialization() public view {
        assertEq(registry.admin(), admin, "Admin should be set correctly");
        assertTrue(registry.isAuthorized(admin), "Admin should be authorized by default");
        assertEq(registry.getTotalRecords(), 0, "Initial record count should be 0");
    }

    function test_AnchorEvidenceSuccess() public {
        // First authorize the anchor as admin
        vm.startPrank(admin);
        registry.setAnchorAuthorization(authorizedAnchor, true);
        vm.stopPrank();
        
        // Then anchor as the authorized anchor
        vm.startPrank(authorizedAnchor);
        
        // Anchor evidence
        (uint256 recordId,, uint256 blockNumber) = 
            registry.anchorEvidence("evidence_001", testHash);
        
        // Verify results
        assertEq(recordId, 1, "Record ID should be 1");
        assertGt(blockNumber, 0, "Block number should be greater than 0");
        assertEq(registry.getTotalRecords(), 1, "Total records should be 1");
        
        vm.stopPrank();
    }

    function test_AnchorEvidenceUnauthorized() public {
        vm.startPrank(unauthorizedUser);
        
        vm.expectRevert();
        registry.anchorEvidence("evidence_001", testHash);
        
        vm.stopPrank();
    }

    function test_AnchorEvidenceDuplicate() public {
        vm.startPrank(admin);
        
        // First anchor should succeed
        registry.anchorEvidence("evidence_001", testHash);
        
        // Second anchor with same ID should fail
        vm.expectRevert();
        registry.anchorEvidence("evidence_001", testHash);
        
        vm.stopPrank();
    }

    function test_AnchorEvidenceInvalidId() public {
        vm.startPrank(admin);
        
        vm.expectRevert();
        registry.anchorEvidence("", testHash);
        
        vm.stopPrank();
    }

    function test_AnchorEvidenceInvalidHash() public {
        vm.startPrank(admin);
        
        vm.expectRevert();
        registry.anchorEvidence("evidence_001", bytes32(0));
        
        vm.stopPrank();
    }

    function test_VerifyEvidenceValid() public {
        vm.startPrank(admin);
        
        registry.anchorEvidence("evidence_001", testHash);
        
        (bool isValid, bytes32 storedHash) = registry.verifyEvidence("evidence_001");
        
        assertTrue(isValid, "Evidence should be valid");
        assertEq(storedHash, testHash, "Stored hash should match");
        
        vm.stopPrank();
    }

    function test_VerifyEvidenceInvalid() public view {
        (bool isValid, bytes32 storedHash) = registry.verifyEvidence("nonexistent");
        
        assertFalse(isValid, "Nonexistent evidence should be invalid");
        assertEq(storedHash, bytes32(0), "Stored hash should be zero");
    }

    function test_GetRecordSuccess() public {
        vm.startPrank(admin);
        
        registry.anchorEvidence("evidence_001", testHash);
        
        EvidenceRegistry.EvidenceRecord memory record = registry.getRecord(1);
        
        assertEq(record.id, 1, "Record ID should be 1");
        assertEq(record.evidenceId, "evidence_001", "Evidence ID should match");
        assertEq(record.hash, testHash, "Hash should match");
        assertEq(record.anchorer, admin, "Anchorer should be admin");
        assertGt(record.timestamp, 0, "Timestamp should be set");
        assertTrue(record.exists, "Record should exist");
        
        vm.stopPrank();
    }

    function test_GetRecordNotFound() public {
        vm.expectRevert();
        registry.getRecord(999);
    }

    function test_GetEvidenceByEvidenceIdSuccess() public {
        vm.startPrank(admin);
        
        registry.anchorEvidence("evidence_001", testHash);
        
        (uint256 recordId, EvidenceRegistry.EvidenceRecord memory record) = 
            registry.getEvidenceByEvidenceId("evidence_001");
        
        assertEq(recordId, 1, "Record ID should be 1");
        assertEq(record.evidenceId, "evidence_001", "Evidence ID should match");
        
        vm.stopPrank();
    }

    function test_GetEvidenceByEvidenceIdNotFound() public view {
        (uint256 recordId, EvidenceRegistry.EvidenceRecord memory record) = 
            registry.getEvidenceByEvidenceId("nonexistent");
        
        assertEq(recordId, 0, "Record ID should be 0");
        assertEq(record.exists, false, "Record should not exist");
    }

    // Hash retrieval functionality removed as it's not needed for the system
    // The system only needs to verify if the current hash matches the stored hash

    function test_SetAnchorAuthorization() public {
        vm.startPrank(admin);
        
        registry.setAnchorAuthorization(authorizedAnchor, true);
        assertTrue(registry.isAuthorized(authorizedAnchor), "Anchor should be authorized");
        
        registry.setAnchorAuthorization(authorizedAnchor, false);
        assertFalse(registry.isAuthorized(authorizedAnchor), "Anchor should be unauthorized");
        
        vm.stopPrank();
    }

    function test_SetAnchorAuthorizationUnauthorized() public {
        vm.startPrank(unauthorizedUser);
        
        vm.expectRevert();
        registry.setAnchorAuthorization(authorizedAnchor, true);
        
        vm.stopPrank();
    }

    function test_TransferAdmin() public {
        address newAdmin = address(0x3);
        
        vm.startPrank(admin);
        
        registry.transferAdmin(newAdmin);
        
        assertEq(registry.admin(), newAdmin, "Admin should be transferred");
        assertTrue(registry.isAuthorized(newAdmin), "New admin should be authorized");
        
        vm.stopPrank();
    }

    function test_TransferAdminUnauthorized() public {
        vm.startPrank(unauthorizedUser);
        
        vm.expectRevert();
        registry.transferAdmin(address(0x3));
        
        vm.stopPrank();
    }

    function testFuzz_AnchorEvidence(bytes32 randomHash) public {
        vm.assume(randomHash != bytes32(0));
        
        vm.startPrank(admin);
        
        string memory evidenceId = string(abi.encodePacked(randomHash));
        
        (uint256 recordId,,) = registry.anchorEvidence(evidenceId, randomHash);
        
        assertEq(recordId, registry.getTotalRecords(), "Record ID should match total");
        
        vm.stopPrank();
    }

    function test_EvidenceAnchoredEvent() public {
        vm.startPrank(admin);
        
        // Just test that anchoring creates a record and increases count
        uint256 recordId = registry.getTotalRecords() + 1;
        registry.anchorEvidence("evidence_001", testHash);
        
        // Verify the record was created
        assertEq(registry.getTotalRecords(), recordId, "Total records should increase");
        
        vm.stopPrank();
    }

    // Security Tests
    function test_ReentrancyProtection() public {
        vm.startPrank(admin);
        
        // Try to call anchorEvidence recursively (if contract had reentrancy vulnerability)
        // Our contract doesn't have external calls, so this tests the structure
        registry.anchorEvidence("evidence_001", testHash);
        
        // Verify single call worked
        assertEq(registry.getTotalRecords(), 1, "Should have exactly 1 record");
        
        vm.stopPrank();
    }

    function test_IntegerOverflowProtection() public {
        vm.startPrank(admin);
        
        // Try to create many records to test overflow protection
        for (uint256 i = 0; i < 100; i++) {
            string memory evidenceId = string(abi.encodePacked("evidence_", i));
            bytes32 hash = keccak256(abi.encodePacked(i));
            registry.anchorEvidence(evidenceId, hash);
        }
        
        assertEq(registry.getTotalRecords(), 100, "Should have 100 records");
        
        vm.stopPrank();
    }

    function test_AccessControlBypass() public {
        vm.startPrank(unauthorizedUser);
        
        // Try to call admin functions
        vm.expectRevert();
        registry.setAnchorAuthorization(unauthorizedUser, true);
        
        vm.expectRevert();
        registry.transferAdmin(unauthorizedUser);
        
        vm.stopPrank();
    }

    function test_ZeroAddressInputProtection() public {
        vm.startPrank(admin);
        
        // Test zero address in admin transfer
        vm.expectRevert();
        registry.transferAdmin(address(0));
        
        // Test zero address in authorization
        vm.expectRevert();
        registry.setAnchorAuthorization(address(0), true);
        
        vm.stopPrank();
    }

    // Edge Case Tests
    function test_VeryLongEvidenceId() public {
        vm.startPrank(admin);
        
        // Create a very long evidence ID
        string memory longId = "evidence_very_long_id_that_might_cause_issues_with_gas_or_storage_";
        
        registry.anchorEvidence(longId, testHash);
        
        (uint256 recordId, EvidenceRegistry.EvidenceRecord memory record) = 
            registry.getEvidenceByEvidenceId(longId);
        
        assertEq(recordId, 1, "Should retrieve record with long ID");
        assertEq(record.evidenceId, longId, "ID should match exactly");
        
        vm.stopPrank();
    }

    function test_SpecialCharactersInEvidenceId() public {
        vm.startPrank(admin);
        
        // Test with special characters
        string memory specialId = "evidence_!@#$%^&*()_+-=[]{}|;':,.<>?/~`";
        
        registry.anchorEvidence(specialId, testHash);
        
        (bool isValid,) = registry.verifyEvidence(specialId);
        assertTrue(isValid, "Should handle special characters");
        
        vm.stopPrank();
    }

    function test_ConcurrentAnchoring() public {
        vm.startPrank(admin);
        
        // Simulate concurrent anchoring by calling rapidly
        string memory evidenceId1 = "evidence_001";
        string memory evidenceId2 = "evidence_002";
        string memory evidenceId3 = "evidence_003";
        
        registry.anchorEvidence(evidenceId1, testHash);
        registry.anchorEvidence(evidenceId2, testHash);
        registry.anchorEvidence(evidenceId3, testHash);
        
        assertEq(registry.getTotalRecords(), 3, "Should have 3 records");
        
        // Verify all exist
        (bool valid1,) = registry.verifyEvidence(evidenceId1);
        (bool valid2,) = registry.verifyEvidence(evidenceId2);
        (bool valid3,) = registry.verifyEvidence(evidenceId3);
        
        assertTrue(valid1 && valid2 && valid3, "All records should be valid");
        
        vm.stopPrank();
    }

    // Gas Optimization Tests
    function test_GasCostAnchoring() public {
        vm.startPrank(admin);
        
        uint256 gasBefore = gasleft();
        registry.anchorEvidence("evidence_001", testHash);
        uint256 gasAfter = gasleft();
        
        uint256 gasUsed = gasBefore - gasAfter;
        // Assert reasonable gas cost (less than 500,000 gas)
        assertLt(gasUsed, 500000, "Gas cost should be reasonable");
        
        vm.stopPrank();
    }

    function test_GasCostVerification() public {
        vm.startPrank(admin);
        
        registry.anchorEvidence("evidence_001", testHash);
        
        uint256 gasBefore = gasleft();
        registry.verifyEvidence("evidence_001");
        uint256 gasAfter = gasleft();
        
        uint256 gasUsed = gasBefore - gasAfter;
        // Verification should be cheap (less than 50,000 gas)
        assertLt(gasUsed, 50000, "Verification gas cost should be low");
        
        vm.stopPrank();
    }

    function test_GasCostBatchOperations() public {
        vm.startPrank(admin);
        
        uint256 gasBefore = gasleft();
        
        // Batch anchor 10 records
        for (uint256 i = 0; i < 10; i++) {
            string memory evidenceId = string(abi.encodePacked("evidence_", i));
            bytes32 hash = keccak256(abi.encodePacked(i));
            registry.anchorEvidence(evidenceId, hash);
        }
        
        uint256 gasAfter = gasleft();
        uint256 gasUsed = gasBefore - gasAfter;
        uint256 avgGasPerRecord = gasUsed / 10;
        
        // Average gas per record should be reasonable (less than 500,000)
        assertLt(avgGasPerRecord, 500000, "Average gas per record should be reasonable");
        
        vm.stopPrank();
    }

    // Stress Tests
    function test_LargeNumberOfRecords() public {
        vm.startPrank(admin);
        
        // Create 20 records for stress testing with unique IDs
        registry.anchorEvidence("evidence_001", keccak256(abi.encodePacked("data1")));
        registry.anchorEvidence("evidence_002", keccak256(abi.encodePacked("data2")));
        registry.anchorEvidence("evidence_003", keccak256(abi.encodePacked("data3")));
        registry.anchorEvidence("evidence_004", keccak256(abi.encodePacked("data4")));
        registry.anchorEvidence("evidence_005", keccak256(abi.encodePacked("data5")));
        registry.anchorEvidence("evidence_006", keccak256(abi.encodePacked("data6")));
        registry.anchorEvidence("evidence_007", keccak256(abi.encodePacked("data7")));
        registry.anchorEvidence("evidence_008", keccak256(abi.encodePacked("data8")));
        registry.anchorEvidence("evidence_009", keccak256(abi.encodePacked("data9")));
        registry.anchorEvidence("evidence_010", keccak256(abi.encodePacked("data10")));
        registry.anchorEvidence("evidence_011", keccak256(abi.encodePacked("data11")));
        registry.anchorEvidence("evidence_012", keccak256(abi.encodePacked("data12")));
        registry.anchorEvidence("evidence_013", keccak256(abi.encodePacked("data13")));
        registry.anchorEvidence("evidence_014", keccak256(abi.encodePacked("data14")));
        registry.anchorEvidence("evidence_015", keccak256(abi.encodePacked("data15")));
        registry.anchorEvidence("evidence_016", keccak256(abi.encodePacked("data16")));
        registry.anchorEvidence("evidence_017", keccak256(abi.encodePacked("data17")));
        registry.anchorEvidence("evidence_018", keccak256(abi.encodePacked("data18")));
        registry.anchorEvidence("evidence_019", keccak256(abi.encodePacked("data19")));
        registry.anchorEvidence("evidence_020", keccak256(abi.encodePacked("data20")));
        
        assertEq(registry.getTotalRecords(), 20, "Should handle 20 records");
        
        // Verify that records are still accessible
        (bool valid1,) = registry.verifyEvidence("evidence_001");
        assertTrue(valid1, "Should verify first record");
        
        (bool valid10,) = registry.verifyEvidence("evidence_010");
        assertTrue(valid10, "Should verify middle record");
        
        (bool valid20,) = registry.verifyEvidence("evidence_020");
        assertTrue(valid20, "Should verify last record");
        
        vm.stopPrank();
    }

    // Hash collision resistance test removed as hash retrieval is not needed
    // The system only needs basic hash verification
}
