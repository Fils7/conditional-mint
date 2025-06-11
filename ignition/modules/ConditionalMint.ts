import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OWNER = "0x715Ef5E2Bc1DF1442f90836Bf2974d6Dd90c7CB9";
const PLATFORM_WALLET = "0x715Ef5E2Bc1DF1442f90836Bf2974d6Dd90c7CB9";

const ConditionalModule = buildModule("ConditionalModule", (m) => {
  const conditional = m.contract("Conditional", [OWNER, PLATFORM_WALLET]);
  return { conditional };
});

export default ConditionalModule;
