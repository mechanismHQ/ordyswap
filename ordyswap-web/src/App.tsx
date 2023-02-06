import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { ClientProvider } from "@micro-stacks/react";
import { Auth } from "./components/auth";
import "./App.css";
import { Tx } from "./components/tx";

function App() {
  return (
    <ClientProvider appName="Ordyswap" appIconUrl="/">
      <div className="App">
        <h1>ordyswap ui thingy</h1>
        <Auth />
        <p>this little web app makes signing transactions from a CLI easier</p>
        <Tx />
      </div>
    </ClientProvider>
  );
}

export default App;
