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
