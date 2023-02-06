import { Address, OutScript } from "micro-btc-signer";
import { IntegerType } from "micro-stacks/common";
import BigNumber from "bignumber.js";

export function addressToOutput(address: string) {
  const addr = Address().decode(address);
  return OutScript.encode(addr);
}

export function outputToAddress(output: Uint8Array) {
  return Address().encode(OutScript.decode(output));
}

/**
 * a188465951f549724ce1206d31efecacc93716a49dfb21081ac0076f291b1231i0
 * @param id
 */
export function decodeOrdId(id: string) {
  if (id.length !== 66) {
    throw new Error("Invalid Ord ID: expected 66 chars");
  }
  const txid = id.slice(0, 64);
  const idx = id.slice(65);
  return {
    txid,
    index: parseInt(idx, 10),
  };
}

export function reverseBuffer(buffer: Uint8Array): Uint8Array {
  if (buffer.length < 1) return buffer;
  let j = buffer.length - 1;
  let tmp = 0;
  for (let i = 0; i < buffer.length / 2; i++) {
    tmp = buffer[i];
    buffer[i] = buffer[j];
    buffer[j] = tmp;
    j--;
  }
  return Uint8Array.from(buffer);
}

export type IntegerOrBN = IntegerType | BigNumber;

export function intToString(int: IntegerOrBN) {
  const str = typeof int === "bigint" ? int.toString() : String(int);
  return str;
}

export function satsToBtc(sats: IntegerOrBN, minDecimals?: number) {
  const n = new BigNumber(intToString(sats)).shiftedBy(-8).decimalPlaces(8);
  if (typeof minDecimals === "undefined") return n.toFormat();
  const rounded = n.toFormat(minDecimals);
  const normal = n.toFormat();
  return rounded.length > normal.length ? rounded : normal;
}

export function btcToSatsBN(btc: IntegerOrBN) {
  return new BigNumber(intToString(btc)).shiftedBy(8).decimalPlaces(0);
}

export function stxToMicroStx(stx: number | string) {
  const n = new BigNumber(stx).shiftedBy(6).decimalPlaces(0);
  return n;
}

export function btcToSats(btc: IntegerOrBN) {
  return btcToSatsBN(btc).toString();
}
