import ElectrumClient from "electrum-client-sl";
import {
  fetchBlockByBurnBlockHeight,
  fetchCoreApiInfo,
} from "micro-stacks/api";
import { bytesToHex, hexToBytes } from "micro-stacks/common";
import { StacksMainnet } from "micro-stacks/network";
import { btcToSats, reverseBuffer } from "./utils";
import { Transaction } from "micro-btc-signer";

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

export async function getTxData(txid: string, address: string) {
  return withElectrumClient(async (electrumClient) => {
    const tx = await electrumClient.blockchain_transaction_get(txid, true);
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

    const amount = btcToSats(tx.vout[outputIndex].value);
    const blockArg = {
      header: hexToBytes(header),
      height: stacksHeight,
    };

    const txHex = getTxHex(tx.hex);

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
