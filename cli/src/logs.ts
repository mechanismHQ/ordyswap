import { StacksMainnet } from "micro-stacks/network";
import { fetchContractEventsById } from "micro-stacks/api";
import { swapContract } from "./contract";
import { cvToJSON, hexToCvValue } from "@clarigen/core";
import { hexToCV } from "micro-stacks/clarity";
// import { ContractE } from '@stacks/stacks-blockchain-api-types';

const network = new StacksMainnet();

export type ApiEvents = Awaited<ReturnType<typeof fetchContractEventsById>>;
export type ApiEvent = ApiEvents[0];

export interface ApiEventResponse {
  results: ApiEvents;
}

export async function getEvents(offset = 0): Promise<ApiEventResponse> {
  const contractId = swapContract().identifier;
  const response = (await fetchContractEventsById({
    url: network.getCoreApiUrl(),
    contract_id: contractId,
    unanchored: true,
    offset,
  })) as unknown as ApiEventResponse;
  return response;
}

export async function getAllPrints(events: any[] = [], offset = 0) {
  const { results } = await getEvents(offset);

  for (let i = 0; i < results.length; i++) {
    const apiEvent = results[i];
    const event = getPrintFromRawEvent(apiEvent);
    if (event === null) continue;
    events.push(event);
  }
  if (results.length === 0) {
    return events;
  }
  return getAllPrints(events, offset + results.length);
}

export function getPrintFromRawEvent(
  event: ApiEvent
): Record<string, any> | null {
  if (event.event_type !== "smart_contract_log") {
    return null;
  }
  const cv = hexToCV(event.contract_log.value.hex);
  const v = cvToJSON(cv);
  if ("topic" in v) {
    const print = v;
    return {
      txid: event.tx_id,
      index: event.event_index,
      print,
    };
  }
  return null;
}
