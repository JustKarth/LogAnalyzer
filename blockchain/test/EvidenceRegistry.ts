import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.create();

describe("EvidenceRegistry", function () {
  let registry: any;
  let admin: any;
  let authorizedAnchor: any;
  let unauthorizedUser: any;
  let testHash: string;

  async function deployRegistryFixture() {
    const [signer1, signer2, signer3] = await ethers.getSigners();
    admin = signer1;
    authorizedAnchor = signer2;
    unauthorizedUser = signer3;
    
    const registryContract = await ethers.deployContract("EvidenceRegistry", [admin.address]);
    
    // Authorize the second signer
    await registryContract.connect(admin).setAnchorAuthorization(authorizedAnchor.address, true);
    
    testHash = ethers.keccak256(ethers.toUtf8Bytes("test evidence data"));
    
    return { registryContract, admin, authorizedAnchor, unauthorizedUser, testHash };
  }

  beforeEach(async function () {
    const { registryContract } = await networkHelpers.loadFixture(deployRegistryFixture);
    registry = registryContract;
  });

  describe("Deployment", function () {
    it("Should set the correct admin", async function () {
      expect(await registry.admin()).to.equal(admin.address);
    });

    it("Should authorize admin by default", async function () {
      expect(await registry.isAuthorized(admin.address)).to.be.true;
    });

    it("Should start with zero records", async function () {
      expect(await registry.getTotalRecords()).to.equal(0n);
    });
  });

  describe("Evidence Anchoring", function () {
    it("Should anchor evidence successfully", async function () {
      const tx = await registry.connect(authorizedAnchor).anchorEvidence("evidence_001", testHash);
      const receipt = await tx.wait();
      
      expect(await registry.getTotalRecords()).to.equal(1n);
      
      // Check that the event was emitted
      const event = await registry.queryFilter(registry.filters.EvidenceAnchored());
      expect(event.length).to.be.greaterThan(0);
    });

    it("Should fail when unauthorized user tries to anchor", async function () {
      await expect(
        registry.connect(unauthorizedUser).anchorEvidence("evidence_001", testHash)
      ).to.be.revertedWithCustomError(registry, "UnauthorizedAddress");
    });

    it("Should fail when anchoring duplicate evidence ID", async function () {
      await registry.connect(admin).anchorEvidence("evidence_001", testHash);
      
      await expect(
        registry.connect(admin).anchorEvidence("evidence_001", testHash)
      ).to.be.revertedWithCustomError(registry, "EvidenceAlreadyExists");
    });

    it("Should fail with empty evidence ID", async function () {
      await expect(
        registry.connect(admin).anchorEvidence("", testHash)
      ).to.be.revertedWithCustomError(registry, "InvalidEvidenceId");
    });

    it("Should fail with zero hash", async function () {
      await expect(
        registry.connect(admin).anchorEvidence("evidence_001", ethers.ZeroHash)
      ).to.be.revertedWithCustomError(registry, "InvalidHash");
    });

    it("Should emit EvidenceAnchored event", async function () {
      const tx = await registry.connect(admin).anchorEvidence("evidence_001", testHash);
      const receipt = await tx.wait();
      
      const events = await registry.queryFilter(registry.filters.EvidenceAnchored());
      expect(events.length).to.be.greaterThan(0);
      
      const event = events[0];
      expect(event.args?.recordId).to.equal(1n);
      expect(event.args?.hash).to.equal(testHash);
      expect(event.args?.anchorer).to.equal(admin.address);
    });
  });

  describe("Evidence Verification", function () {
    it("Should verify valid evidence", async function () {
      await registry.connect(admin).anchorEvidence("evidence_001", testHash);
      
      const [isValid, storedHash] = await registry.verifyEvidence("evidence_001");
      
      expect(isValid).to.be.true;
      expect(storedHash).to.equal(testHash);
    });

    it("Should return false for non-existent evidence", async function () {
      const [isValid, storedHash] = await registry.verifyEvidence("nonexistent");
      
      expect(isValid).to.be.false;
      expect(storedHash).to.equal(ethers.ZeroHash);
    });
  });

  describe("Record Retrieval", function () {
    it("Should get record by ID", async function () {
      await registry.connect(admin).anchorEvidence("evidence_001", testHash);
      
      const record = await registry.getRecord(1n);
      
      expect(record.id).to.equal(1n);
      expect(record.evidenceId).to.equal("evidence_001");
      expect(record.hash).to.equal(testHash);
      expect(record.anchorer).to.equal(admin.address);
      expect(record.exists).to.be.true;
    });

    it("Should fail when getting non-existent record", async function () {
      await expect(registry.getRecord(999n))
        .to.be.revertedWithCustomError(registry, "RecordNotFound");
    });

    it("Should get evidence by evidence ID", async function () {
      await registry.connect(admin).anchorEvidence("evidence_001", testHash);
      
      const [recordId, record] = await registry.getEvidenceByEvidenceId("evidence_001");
      
      expect(recordId).to.equal(1n);
      expect(record.evidenceId).to.equal("evidence_001");
      expect(record.exists).to.be.true;
    });

    it("Should return empty for non-existent evidence ID", async function () {
      const [recordId, record] = await registry.getEvidenceByEvidenceId("nonexistent");
      
      expect(recordId).to.equal(0n);
      expect(record.exists).to.be.false;
    });
  });

  describe("Access Control", function () {
    it("Should allow admin to authorize anchors", async function () {
      await registry.connect(admin).setAnchorAuthorization(unauthorizedUser.address, true);
      
      expect(await registry.isAuthorized(unauthorizedUser.address)).to.be.true;
    });

    it("Should allow admin to revoke authorization", async function () {
      await registry.connect(admin).setAnchorAuthorization(authorizedAnchor.address, false);
      
      expect(await registry.isAuthorized(authorizedAnchor.address)).to.be.false;
    });

    it("Should fail when non-admin tries to authorize", async function () {
      await expect(
        registry.connect(unauthorizedUser).setAnchorAuthorization(authorizedAnchor.address, true)
      ).to.be.revertedWithCustomError(registry, "UnauthorizedAddress");
    });

    it("Should allow admin to transfer admin role", async function () {
      await registry.connect(admin).transferAdmin(authorizedAnchor.address);
      
      expect(await registry.admin()).to.equal(authorizedAnchor.address);
      expect(await registry.isAuthorized(authorizedAnchor.address)).to.be.true;
    });

    it("Should fail when non-admin tries to transfer admin", async function () {
      await expect(
        registry.connect(unauthorizedUser).transferAdmin(authorizedAnchor.address)
      ).to.be.revertedWithCustomError(registry, "UnauthorizedAddress");
    });
  });

  describe("Integration Tests", function () {
    it("Should handle complete evidence lifecycle", async function () {
      // Anchor evidence
      const tx = await registry.connect(admin).anchorEvidence("evidence_001", testHash);
      const receipt = await tx.wait();
      
      // Extract event data
      const event = receipt.logs.find((log: any) => {
        try {
          return registry.interface.parseLog(log).name === "EvidenceAnchored";
        } catch {
          return false;
        }
      });
      
      let recordId = 0n;
      if (event) {
        const parsed = registry.interface.parseLog(event);
        recordId = parsed.args.recordId;
      }
      
      expect(recordId).to.equal(1n);
      
      // Verify evidence
      const [isValid, storedHash] = await registry.verifyEvidence("evidence_001");
      expect(isValid).to.be.true;
      expect(storedHash).to.equal(testHash);
      
      // Get record
      const record = await registry.getRecord(recordId);
      expect(record.evidenceId).to.equal("evidence_001");
      expect(record.hash).to.equal(testHash);
    });

    it("Should handle multiple evidence records", async function () {
      const evidenceCount = 5;
      
      for (let i = 1; i <= evidenceCount; i++) {
        const evidenceId = `evidence_00${i}`;
        const hash = ethers.keccak256(ethers.toUtf8Bytes(`data_${i}`));
        await registry.connect(admin).anchorEvidence(evidenceId, hash);
      }
      
      expect(await registry.getTotalRecords()).to.equal(BigInt(evidenceCount));
      
      // Verify all records
      for (let i = 1; i <= evidenceCount; i++) {
        const evidenceId = `evidence_00${i}`;
        const [isValid] = await registry.verifyEvidence(evidenceId);
        expect(isValid).to.be.true;
      }
    });

    it("Should handle batch operations efficiently", async function () {
      const batchSize = 10;
      const gasCosts: bigint[] = [];
      
      for (let i = 0; i < batchSize; i++) {
        const evidenceId = `batch_evidence_${i}`;
        const hash = ethers.keccak256(ethers.toUtf8Bytes(`batch_data_${i}`));
        
        const tx = await registry.connect(admin).anchorEvidence(evidenceId, hash);
        const receipt = await tx.wait();
        gasCosts.push(receipt.gasUsed);
      }
      
      // Calculate average gas cost
      const totalGas = gasCosts.reduce((sum, cost) => sum + cost, 0n);
      const avgGas = totalGas / BigInt(batchSize);
      
      // Average gas should be reasonable (less than 500,000)
      expect(avgGas).to.be.lessThan(500000n);
      
      expect(await registry.getTotalRecords()).to.equal(BigInt(batchSize));
    });

    it("Should maintain data integrity over time", async function () {
      // Anchor multiple records
      const records = [
        { id: "evidence_001", hash: ethers.keccak256(ethers.toUtf8Bytes("data1")) },
        { id: "evidence_002", hash: ethers.keccak256(ethers.toUtf8Bytes("data2")) },
        { id: "evidence_003", hash: ethers.keccak256(ethers.toUtf8Bytes("data3")) },
      ];
      
      for (const record of records) {
        await registry.connect(admin).anchorEvidence(record.id, record.hash);
      }
      
      // Simulate time passing by mining blocks
      await networkHelpers.mine(10);
      
      // Verify records are still intact
      for (const record of records) {
        const [isValid, storedHash] = await registry.verifyEvidence(record.id);
        expect(isValid).to.be.true;
        expect(storedHash).to.equal(record.hash);
      }
    });

    it("Should handle concurrent-like operations", async function () {
      // Simulate rapid consecutive operations
      const operations = [];
      
      for (let i = 0; i < 5; i++) {
        const evidenceId = `concurrent_${i}`;
        const hash = ethers.keccak256(ethers.toUtf8Bytes(`concurrent_data_${i}`));
        operations.push(registry.connect(admin).anchorEvidence(evidenceId, hash));
      }
      
      // Execute all operations
      await Promise.all(operations);
      
      expect(await registry.getTotalRecords()).to.equal(5n);
      
      // Verify all records
      for (let i = 0; i < 5; i++) {
        const evidenceId = `concurrent_${i}`;
        const [isValid] = await registry.verifyEvidence(evidenceId);
        expect(isValid).to.be.true;
      }
    });
  });

  describe("Error Handling", function () {
    it("Should handle invalid input gracefully", async function () {
      // Test various invalid inputs
      const invalidInputs = [
        { id: "", hash: testHash, expectedError: "InvalidEvidenceId" },
        { id: "evidence_001", hash: ethers.ZeroHash, expectedError: "InvalidHash" },
      ];
      
      for (const input of invalidInputs) {
        await expect(
          registry.connect(admin).anchorEvidence(input.id, input.hash)
        ).to.be.revertedWithCustomError(registry, input.expectedError as any);
      }
    });

    it("Should provide meaningful error messages", async function () {
      try {
        await registry.connect(unauthorizedUser).anchorEvidence("evidence_001", testHash);
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).to.include("UnauthorizedAddress");
      }
    });

    it("Should handle record not found errors", async function () {
      await expect(registry.getRecord(999n))
        .to.be.revertedWithCustomError(registry, "RecordNotFound");
    });
  });

  describe("Performance Tests", function () {
    it("Should scale with large datasets", async function () {
      const largeDatasetSize = 50;
      
      // Create large dataset
      for (let i = 0; i < largeDatasetSize; i++) {
        const evidenceId = `large_${i}`;
        const hash = ethers.keccak256(ethers.toUtf8Bytes(`large_data_${i}`));
        await registry.connect(admin).anchorEvidence(evidenceId, hash);
      }
      
      const startTime = Date.now();
      
      // Verify random access performance
      const randomIndices = [0, 12, 25, 37, 49];
      for (const index of randomIndices) {
        const evidenceId = `large_${index}`;
        await registry.verifyEvidence(evidenceId);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 5 seconds)
      expect(duration).to.be.lessThan(5000);
    });

    it("Should maintain consistent gas costs", async function () {
      const gasCosts: bigint[] = [];
      const iterations = 10;
      
      for (let i = 0; i < iterations; i++) {
        const evidenceId = `gas_test_${i}`;
        const hash = ethers.keccak256(ethers.toUtf8Bytes(`gas_data_${i}`));
        
        const tx = await registry.connect(admin).anchorEvidence(evidenceId, hash);
        const receipt = await tx.wait();
        gasCosts.push(receipt.gasUsed);
      }
      
      // Calculate standard deviation
      const avgGas = gasCosts.reduce((sum, cost) => sum + cost, 0n) / BigInt(iterations);
      const variance = gasCosts.reduce((sum, cost) => {
        const diff = cost - avgGas;
        return sum + diff * diff;
      }, 0n) / BigInt(iterations);
      
      // Gas costs should be relatively consistent (variance should be reasonable)
      expect(variance).to.be.lessThan(avgGas * avgGas / 100n); // Less than 1% of mean squared
    });
  });

  describe("Security Edge Cases", function () {
    it("Should prevent front-running on evidence IDs", async function () {
      const evidenceId = "front_run_test";
      const hash1 = ethers.keccak256(ethers.toUtf8Bytes("data1"));
      const hash2 = ethers.keccak256(ethers.toUtf8Bytes("data2"));
      
      // First user anchors
      await registry.connect(admin).anchorEvidence(evidenceId, hash1);
      
      // Second user tries to anchor same ID (should fail)
      await expect(
        registry.connect(authorizedAnchor).anchorEvidence(evidenceId, hash2)
      ).to.be.revertedWithCustomError(registry, "EvidenceAlreadyExists");
      
      // Original hash should be preserved
      const [, storedHash] = await registry.verifyEvidence(evidenceId);
      expect(storedHash).to.equal(hash1);
    });

    it("Should handle role changes correctly", async function () {
      // User is authorized
      await registry.connect(admin).setAnchorAuthorization(authorizedAnchor.address, true);
      await registry.connect(authorizedAnchor).anchorEvidence("auth_test_1", testHash);
      
      // Revoke authorization
      await registry.connect(admin).setAnchorAuthorization(authorizedAnchor.address, false);
      
      // Should fail after revocation
      await expect(
        registry.connect(authorizedAnchor).anchorEvidence("auth_test_2", testHash)
      ).to.be.revertedWithCustomError(registry, "UnauthorizedAddress");
      
      // Admin should still work
      await registry.connect(admin).anchorEvidence("auth_test_3", testHash);
      expect(await registry.getTotalRecords()).to.equal(2n);
    });
  });
});
