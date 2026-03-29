import { Buffer } from "buffer";
globalThis.Buffer = Buffer;

import ReactDOM from "react-dom/client";

import "@rainbow-me/rainbowkit/styles.css";
import "@/src/globals.css";

import { App } from "@/src/App";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
