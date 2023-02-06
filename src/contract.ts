import { project, contracts } from "./clarigen";
import { contractFactory, projectFactory } from "@clarigen/core";
import { ClarigenNodeClient } from "@clarigen/node";
import { StacksMainnet } from "micro-stacks/network";

export function swapContract() {
  return projectFactory(project, "mainnet").ordSwap;
  // return contractFactory(contracts.ordSwap, "AAA.b");
}

export function clarigenClient() {
  return new ClarigenNodeClient(new StacksMainnet());
}

export async function getOffer(idStr: string) {
  const id = BigInt(idStr);
  const clarigen = clarigenClient();
  const contract = swapContract();
  const offer = await clarigen.ro(contract.getOffer(id));
  return offer
    ? {
        ...offer,
        id,
      }
    : null;
}
