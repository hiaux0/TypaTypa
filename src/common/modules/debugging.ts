import { getIsInputActive } from "./htmlElements";

export function initDebugShortcuts() {
  document.addEventListener("keydown", (event) => {
    const key = event.key;
    switch (key) {
      case "c": {
        if (getIsInputActive()) return;
        // console.clear();
      }
    }
  });
}

export function getCallerFunctionName(error: Error = new Error()): string {
  const stack = error.stack.split("\n");
  const callerLine = stack[2]; // Adjust index based on the stack trace format
  const index = callerLine.indexOf("@http");
  let functionName = callerLine.slice(0, index) || "function not found";
  if (functionName.endsWith("/<")) {
    functionName = callerLine.slice(0, functionName.length - 2);
  }
  return functionName;
}
