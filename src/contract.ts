import { project, contracts } from "./clarigen";
import { contractFactory, projectFactory } from "@clarigen/core";
import { ClarigenNodeClient } from "@clarigen/node";
import { StacksMainnet } from "micro-stacks/network";
import { outputToAddress } from "./utils";
import { getTxData, getTxPending } from "./tx-data";

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
  const offer = await clarigen.ro(contract.getOffer(id), { latest: true });
  return offer
    ? {
        ...offer,
        id,
      }
    : null;
}

export async function isTransferValid(txid: string, offerId: string) {
  const offer = await getOffer(offerId);
  if (offer === null) {
    // console.log(`Couldn't find offer with ID ${offerId}`);
    throw new Error(`No offer with id ${offerId}`);
  }
  const recipientBtc = outputToAddress(offer.output);
  const txBase = await getTxPending(txid, recipientBtc);
  if (!txBase.confirmations) {
    console.log("Transaction is pending. Checking validity");
    return {
      isOk: false,
      value: 0n,
    };
  }
  const txData = await getTxData(txid, recipientBtc);
  const checkValid = swapContract().validateOfferTransfer({
    tx: txData.txHex,
    outputIndex: txData.outputIndex,
    offerId: offer.id,
    prevBlocks: txData.prevBlocks,
    proof: txData.proof,
    block: txData.block,
  });
  const result = await clarigenClient().ro(checkValid, { latest: true });
  return result;
}
