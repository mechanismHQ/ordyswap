import ElectrumClient from "electrum-client-sl";
import {
  fetchBlockByBurnBlockHeight,
  fetchCoreApiInfo,
} from "micro-stacks/api";
import { bytesToHex, hexToBytes } from "micro-stacks/common";
import { StacksMainnet } from "micro-stacks/network";
import { btcToSats, outputToAddress, reverseBuffer } from "./utils";
import { Transaction } from "micro-btc-signer";
import type { Offer } from "./contract";

export const network = new StacksMainnet();

export function getElectrumConfig() {
  return {
    host: "fortress.qtornado.com",
    port: 443,
    protocol: "ssl",
  };
}

export function getElectrumClient() {
  const electrumConfig = getElectrumConfig();
  return new ElectrumClient(
    electrumConfig.host,
    electrumConfig.port,
    electrumConfig.protocol
  );
}

export async function withElectrumClient<T = void>(
  cb: (client: ElectrumClient) => Promise<T>
): Promise<T> {
  const electrumClient = getElectrumClient();
  const client = electrumClient;
  await client.connect();
  try {
    const res = await cb(client);
    await client.close();
    return res;
  } catch (error) {
    console.error(`Error from withElectrumConfig`, error);
    await client.close();
    throw error;
  }
}

interface StacksBlockByHeight {
  header: string;
  prevBlocks: string[];
  stacksHeight: number;
}
export async function findStacksBlockAtHeight(
  height: number,
  prevBlocks: string[],
  electrumClient: ElectrumClient
): Promise<StacksBlockByHeight> {
  const [header, stacksHeight] = await Promise.all([
    electrumClient.blockchain_block_header(height),
    getStacksHeight(height),
  ]);
  if (typeof stacksHeight !== "undefined") {
    return {
      header,
      prevBlocks,
      stacksHeight,
    };
  }
  prevBlocks.unshift(header);
  return findStacksBlockAtHeight(height + 1, prevBlocks, electrumClient);
}

export async function getStacksHeight(burnHeight: number) {
  try {
    const url = network.getCoreApiUrl();
    const block = await fetchBlockByBurnBlockHeight({
      url,
      burn_block_height: burnHeight,
    });
    return block.height;
  } catch (error) {
    return undefined;
  }
}

export function getTxHex(hex: string) {
  const tx = Transaction.fromRaw(hexToBytes(hex));
  return tx.toBytes(true, false);
}

export async function fetchTx(txid: string, client: ElectrumClient) {
  const tx = await client.blockchain_transaction_get(txid, true);
  return tx;
}

export async function getTxPending(txid: string) {
  return withElectrumClient(async (client) => {
    const tx = await fetchTx(txid, client);
    return tx;
  });
}

export async function getTxData(txid: string, offer: Offer) {
  return withElectrumClient(async (electrumClient) => {
    const address = outputToAddress(offer.output);
    const ordTxid = bytesToHex(offer.txid);
    const ordIdx = Number(offer.index);
    const tx = await electrumClient.blockchain_transaction_get(txid, true);
    if (typeof tx.confirmations === "undefined" || tx.confirmations < 1) {
      throw new Error("Tx is not confirmed");
    }
    const burnHeight = await confirmationsToHeight(tx.confirmations);
    const { header, stacksHeight, prevBlocks } = await findStacksBlockAtHeight(
      burnHeight,
      [],
      electrumClient
    );

    const merkle = await electrumClient.blockchain_transaction_getMerkle(
      txid,
      burnHeight
    );
    const hashes = merkle.merkle.map((hash) => {
      return reverseBuffer(hexToBytes(hash));
    });

    const outputIndex = tx.vout.findIndex((vout) => {
      const addressesMatch = vout.scriptPubKey.addresses?.[0] === address;
      const addressMatch = vout.scriptPubKey.address === address;
      return addressMatch || addressesMatch;
    });

    if (outputIndex === -1) {
      // console.log("tx.vout", tx.vout);
      throw new Error("Unable to find matching output");
    }

    const amount = btcToSats(tx.vout[outputIndex].value);
    const blockArg = {
      header: hexToBytes(header),
      height: stacksHeight,
    };

    const txHex = getTxHex(tx.hex);

    const inputIndex = tx.vin.findIndex((vin) => {
      return vin.txid === ordTxid && vin.vout === ordIdx;
    });

    const proofArg = {
      hashes: hashes,
      txIndex: merkle.pos,
      treeDepth: hashes.length,
    };

    return {
      txHex: txHex,
      proof: proofArg,
      block: blockArg,
      prevBlocks: prevBlocks.map((b) => hexToBytes(b)),
      tx,
      outputIndex,
      amount,
      burnHeight,
      inputIndex,
    };
  });
}

export async function confirmationsToHeight(confirmations: number) {
  const url = network.getCoreApiUrl();
  const nodeInfo = await fetchCoreApiInfo({ url });
  const curHeight = nodeInfo.burn_block_height;
  const height = curHeight - confirmations + 1;
  return height;
}
