export class GlobalKeybordService {
  public init(): void {
    document.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "c": {
          console.clear();
        }
      }
    });
  }
}
