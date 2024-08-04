export function initDebugShortcuts() {
  document.addEventListener("keydown", (event) => {
    const key = event.key;
    switch (key) {
      case "c": {
        console.clear();
      }
    }
  });
}
