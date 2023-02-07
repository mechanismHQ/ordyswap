import React, { useCallback, useState } from "react";
import { useOpenContractCall, useAuth } from "@micro-stacks/react";
import { parse } from "superjson";
import { ClarityValue } from "micro-stacks/clarity";
import { PostConditionMode } from "micro-stacks/transactions";

export const Tx: React.FC<{ children?: React.ReactNode }> = () => {
  const [txdata, setTx] = useState("");
  const { isSignedIn } = useAuth();
  const { openContractCall, isRequestPending } = useOpenContractCall();
  const [txid, setTxid] = useState("");

  const submit = useCallback(() => {
    const info = parse(txdata) as {
      contractName: string;
      contractAddress: string;
      functionArgs: ClarityValue[];
      functionName: string;
    };
    openContractCall({
      ...info,
      postConditionMode: PostConditionMode.Allow,
      onFinish(txFinished) {
        setTxid(txFinished.txId);
        setTx("");
      },
    });
    console.log(info);
  }, [txdata, openContractCall]);

  if (!isSignedIn) {
    return null;
  }
  return (
    <div>
      <p>paste in tx data from the cli, and it'll open the stacks wallet</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div style={{ margin: "20px 0" }}>
          <textarea
            style={{
              minWidth: "500px",
              minHeight: "300px",
            }}
            value={txdata}
            onChange={(e) => setTx(e.target.value)}
            placeholder="Paste tx data"
          />
        </div>
        <button>submit</button>
      </form>
      {txid && (
        <>
          <p>Your transaction was broadcasted.</p>
          <p>
            <pre>{txid}</pre>
          </p>
          <p>
            <a
              target="_blank"
              rel="nofollow"
              href={`https://explorer.stacks.co/txid/${txid}?chain=mainnet`}
            >
              View on explorer
            </a>
          </p>
        </>
      )}
    </div>
  );
};
