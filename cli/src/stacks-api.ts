import { fetch } from "cross-fetch";

export interface NameDetails {
  address: string;
}

export async function getAddressFromName(name: string) {
  const url = `https://api.bns.xyz/v1/names/${name}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`No address found for ${name}`);
  }

  const data = (await res.json()) as NameDetails;
  return data.address;
}
