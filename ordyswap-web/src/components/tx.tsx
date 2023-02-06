import React, { useCallback, useState } from "react";
import { useOpenContractCall, useAuth } from "@micro-stacks/react";
import { parse } from "superjson";
import { ClarityValue } from "micro-stacks/clarity";
import { PostConditionMode } from "micro-stacks/transactions";

export const Tx: React.FC<{ children?: React.ReactNode }> = () => {
  const [txdata, setTx] = useState("");
  const { isSignedIn } = useAuth();
  const { openContractCall, isRequestPending } = useOpenContractCall();

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
    });
    console.log(info);
  }, [txdata, openContractCall]);

  if (!isSignedIn) {
    return null;
  }
  return (
    <div>
      <p>paste in tx data from teh cli, and it'll open the stacks wallet</p>
      <form
        onClick={(e) => {
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
    </div>
  );
};
