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
import {
  createSTXPostCondition,
  PostCondition,
} from "micro-stacks/transactions";
// import { bold, yellow, red, italic, underline } from "kleur/colors";
import c from "ansi-colors";
import { getAllPrints } from "../logs";
import { VERSION } from "./version";
import { getAddressFromName } from "../stacks-api";

program
  .name("ordyswap")
  .description("CLI for making Ordinal atomic swaps")
  .version(VERSION);

function serializeTx(
  tx: {
    contractName: string;
    contractAddress: string;
    functionArgs: ClarityValue[];
    functionName: string;
  },
  postConditions: PostCondition[] = []
) {
  const { contractAddress, contractName, functionArgs, functionName } = tx;
  const json = stringify({
    contractAddress,
    contractName,
    functionArgs,
    functionName,
    postConditions,
  });
  console.log("\n---------\nCopy this JSON:\n");
  console.log(
    `Open in ${c.underline.blue("https://mechanismhq.github.io/ordyswap")}`
  );
  console.log(json);
  console.log("\n---------\n");
}

const makeOffer = new Command("make-offer")
  .argument("<ordinalId>", "Ordinal ID")
  .argument("<amount>", "Amount of STX to offer")
  .argument("<btcAddress>", "You Bitcoin (taproot) address")
  .argument(
    "<sellerStxAddress>",
    "The STX address of the Ordinal seller. You can also provide a BNS name."
  )
  .action(async (ordId, amount, btcAddress, recipientOrBns) => {
    const { txid, index } = decodeOrdId(ordId);
    const ustx = stxToMicroStx(amount);
    console.log(c.bold.yellow.bgRed.italic("Important!"));
    const urlRoute = ordId.includes("i") ? "inscription" : "output";
    const url = `https://ordinals.com/${urlRoute}/${ordId}`;
    if (urlRoute === "output") {
      console.log(c.red(`Visit ${c.underline.blue(url)}`));
      console.log(
        c.red("and click on the inscription. On the inscription page,")
      );
      console.log(c.red('make sure the "output" property matches:'));
      console.log(c.italic(`${txid}:${index}`));
    } else {
      console.log(c.red(`Visit ${c.underline.blue(url)}`));
      console.log(c.red('and make sure the "output" property matches:'));
      console.log(c.italic(`${txid}:${index}`));
    }

    let recipientAddress = recipientOrBns;
    let isBns = false;
    if (recipientOrBns.includes(".")) {
      recipientAddress = await getAddressFromName(recipientOrBns);
      isBns = true;
    }

    console.log("");
    console.log("Offer details:");
    console.log("");
    console.log(`${c.bold(amount)} STX`);
    // console.log("ustx", ustx.toFormat());
    // console.log("STX amount", amount);
    const output = addressToOutput(btcAddress);
    console.log("Your BTC Address:", c.bold(btcAddress));
    console.log(
      "Output (scriptHash of your BTC Address):",
      c.italic(bytesToHex(output))
    );
    const addr = Address().decode(btcAddress);
    if (addr.type !== "tr") {
      console.log("The BTC address provided is not p2tr. Exiting.");
    }
    if (isBns) {
      console.log("Seller BNS:", c.bold(recipientOrBns));
    }
    console.log(`Seller STX address:`, c.bold(recipientAddress));

    const tx = swapContract().createOffer({
      txid: hexToBytes(txid),
      index,
      output,
      recipient: recipientAddress,
      amount: BigInt(ustx.toFixed()),
    });
    // const postCondition = createSTXPostCondition()
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
    console.log(
      "Ordinal ID:",
      c.italic(`${bytesToHex(offer.txid)}i${offer.index}`)
    );
    console.log("Seller STX:", c.bold(offer.recipient));
    console.log("Buyer STX:", c.bold(offer.sender));
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
    const txData = await getTxData(txid, offer);

    const tx = swapContract().finalizeOffer({
      block: txData.block,
      proof: txData.proof,
      prevBlocks: txData.prevBlocks,
      offerId: offer.id,
      tx: txData.txHex,
      outputIndex: txData.outputIndex,
      inputIndex: txData.inputIndex,
    });

    serializeTx(tx);
  });

program.addCommand(acceptOffer);

const getTxDataCmd = new Command("get-tx-data")
  .argument("<btcTxid>")
  .argument("[offerId]")
  .option("--verbose", "", false)
  .action(async (txid, offerIdStr, options) => {
    const pending = await getTxPending(txid);
    if (!offerIdStr) {
      console.log("Inputs:");
      pending.vin.forEach((vin) => {
        console.log(`${vin.txid}.${vin.vout}`);
      });
      return;
    }
    const offer = await getOffer(offerIdStr);
    if (typeof pending.confirmations === "undefined") {
      const address = outputToAddress(offer.output);
      const outputIndex = pending.vout.findIndex((vout) => {
        return vout.scriptPubKey.address === address;
      });
      if (outputIndex === 1) {
        console.log(c.red("No matching output found for this offer"));
        return;
      }
      console.log(
        c.bold.green("The tx looks good! You can finalize after confirmation.")
      );
      return;
    }
    const txData = await getTxData(txid, offer);
    if (txData.inputIndex === -1) {
      throw new Error("Expected inputIndex");
    }
    const result = await isTransferValid(txid, offerIdStr);
    if (result.isOk) {
      console.log("Transfer is valid!");
    } else {
      console.log("Error when checking validity:");
      console.log(result.value);
    }
    // if (options.verbose) {
    //   console.log(await getTxPending(txid));
    // }
  });

program.addCommand(getTxDataCmd);

const getLogs = new Command("logs")
  .addHelpText("before", "Show contract logs (new offers, etc)")
  .action(async () => {
    const events = await getAllPrints();
    events.forEach((e) => {
      console.log("-----");
      const {
        print: { topic, ...rest },
      } = e;
      console.log(c.bold(topic));
      console.log(rest);
    });
  });

program.addCommand(getLogs);

program.addCommand(
  new Command("cancel-offer").argument("<offerId>").action((idStr) => {
    const id = BigInt(idStr);
    const tx = swapContract().cancelOffer(id);

    serializeTx(tx);
  })
);

program.addCommand(
  new Command("refund-offer").argument("<offerId>").action((idStr) => {
    const id = BigInt(idStr);
    serializeTx(swapContract().refundCancelledOffer(id));
  })
);

async function run() {
  await program.parseAsync(process.argv);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
