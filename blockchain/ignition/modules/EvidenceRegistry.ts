import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EvidenceRegistryModule", (m) => {
  // Deploy the EvidenceRegistry contract with the deployer as admin
  const deployer = m.getAccount(0);
  const registry = m.contract("EvidenceRegistry", [deployer]);

  // Optionally authorize additional addresses (can be configured later)
  // m.call(registry, "setAnchorAuthorization", [someAddress, true]);

  return { registry };
});
