#!/usr/bin/env node

import { Command, program } from "@commander-js/extra-typings";
import { bytesToHex, hexToBytes } from "micro-stacks/common";
import {
  clarigenClient,
  swapContract,
  getOffer,
  isTransferValid,
} from "../contract";
import { Address } from "micro-btc-signer";
import {
  addressToOutput,
  decodeOrdId,
  outputToAddress,
  stxToMicroStx,
} from "../utils";
import { stringify } from "superjson";
import { ClarityValue } from "micro-stacks/clarity";
import BigNumber from "bignumber.js";
import { getTxData, getTxPending } from "../tx-data";

program.name("ordyswap").description("CLI for making Ordinal atomic swaps");

function serializeTx(tx: {
  contractName: string;
  contractAddress: string;
  functionArgs: ClarityValue[];
  functionName: string;
}) {
  const { contractAddress, contractName, functionArgs, functionName } = tx;
  const json = stringify({
    contractAddress,
    contractName,
    functionArgs,
    functionName,
  });
  console.log("\n---------\nCopy this JSON:\n");
  console.log(json);
  console.log("\n---------\n");
}

const makeOffer = new Command("make-offer")
  .argument("<ordinalId>", "Ordinal ID")
  .argument("<amount>", "Amount of STX to offer")
  .argument("<btcAddress>", "You Bitcoin (taproot) address")
  .argument("<recipient>", "The STX address of the current Ordinal owner")
  .action((ordId, amount, btcAddress, recipientAddress) => {
    const { txid, index } = decodeOrdId(ordId);
    const ustx = stxToMicroStx(amount);
    console.log(`Ordinal: https://ordinals.com/inscription/${ordId}`);
    console.log("txid", txid);
    console.log("index", index);
    console.log("ustx", ustx.toFormat());
    console.log("STX amount", amount);
    const output = addressToOutput(btcAddress);
    console.log("btcAddress", btcAddress);
    console.log("Output", bytesToHex(output));
    const addr = Address().decode(btcAddress);
    if (addr.type !== "tr") {
      console.log("The BTC address provided is not p2tr. Exiting.");
    }

    const tx = swapContract().createOffer({
      txid: hexToBytes(txid),
      index,
      output,
      recipient: recipientAddress,
      amount: BigInt(ustx.toFixed()),
    });
    serializeTx(tx);
    // console.log(tx.nativeArgs);
  });

program.addCommand(makeOffer);

const getOfferCmd = new Command("get-offer")
  .argument("<id>", "Offer Id")
  .action(async (id) => {
    const idInt = BigInt(id);
    const clarigen = clarigenClient();
    const contract = swapContract();
    const offer = await clarigen.ro(contract.getOffer(idInt), { latest: true });
    const cancelledAt = await clarigen.ro(contract.getOfferCancelled(idInt), {
      tip: "latest",
    });
    const refunded = await clarigen.ro(contract.getOfferRefunded(idInt), {
      tip: "latest",
    });
    const accepted = await clarigen.ro(contract.getOfferAccepted(idInt), {
      tip: "latest",
    });
    if (offer === null) {
      console.log(`Couldn't find offer with ID ${id}`);
      return;
    }
    console.log("Ordinal ID:", `${bytesToHex(offer.txid)}i${offer.index}`);
    console.log("Recipient:", offer.recipient);
    console.log("Sender:", offer.sender);
    const amount = new BigNumber(offer.amount.toString())
      .shiftedBy(-6)
      .decimalPlaces(6);
    console.log(`Amount: ${amount.toFormat()} STX`);
    console.log(`Offer BTC address:`, outputToAddress(offer.output));
    if (accepted) {
      console.log("Offer accepted already");
    }
    if (cancelledAt) {
      console.log(
        `Offer was cancelled - can be refunded after BTC block ${cancelledAt}`
      );
    }
    if (refunded) {
      console.log(`Offer was refunded.`);
    }
  });

program.addCommand(getOfferCmd);

const acceptOffer = new Command("finalize-offer")
  .argument("<btcTxid>")
  .argument("<offerId>")
  .action(async (txid, offerIdStr) => {
    const offer = await getOffer(offerIdStr);
    if (offer === null) {
      console.log(`Couldn't find offer with ID ${offerIdStr}`);
      return;
    }
    const isValid = await isTransferValid(txid, offerIdStr);
    if (!isValid.isOk) {
      console.log("Transfer is not valid.");
      console.log("Contract error code", isValid.value);
      return;
    }
    console.log("Transfer is valid!");
    const recipientBtc = outputToAddress(offer.output);
    const txData = await getTxData(txid, recipientBtc);

    const tx = swapContract().acceptOffer({
      block: txData.block,
      proof: txData.proof,
      prevBlocks: txData.prevBlocks,
      offerId: offer.id,
      tx: txData.txHex,
      outputIndex: txData.outputIndex,
    });

    serializeTx(tx);
  });

program.addCommand(acceptOffer);

const getTxDataCmd = new Command("get-tx-data")
  .argument("<btcTxid>")
  .argument("<offerId>")
  .action(async (txid, offerIdStr) => {
    const result = await isTransferValid(txid, offerIdStr);
    if (result.isOk) {
      console.log("Transfer is valid!");
    } else {
      console.log("Error when checking validity:");
      console.log(result.value);
    }
  });

program.addCommand(getTxDataCmd);

async function run() {
  await program.parseAsync(process.argv);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
