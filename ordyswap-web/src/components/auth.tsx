import React from "react";
import { useAuth } from "@micro-stacks/react";

export const Auth: React.FC<{ children?: React.ReactNode }> = () => {
  const { isSignedIn, openAuthRequest, signOut } = useAuth();

  if (isSignedIn) {
    return (
      <div>
        <button onClick={() => signOut()}>sign out</button>
      </div>
    );
  }

  return (
    <div>
      <p>plz sign in</p>
      <button
        onClick={() => {
          openAuthRequest();
        }}
      >
        sign in
      </button>
    </div>
  );
};
