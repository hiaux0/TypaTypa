export class MyApp {
  public message = "Typing App cua Emy";
  //public typedText = "Hello ";
  //public currentLetter = "w";
  //public currentTextToType = "e are typing";
  public typedText = "";
  public currentLetter = "";
  public currentTextToType = "hello we are typing";

  attached() {
    this.initTyping();

    document.addEventListener("keydown", (event) => {
      const key = event.key;
      /*prettier-ignore*/ console.log("[my-app.ts,8] key: ", key);
      if (key === this.currentLetter) {
        this.typedText += key;
        this.currentLetter = this.currentTextToType[0];
        this.currentTextToType = this.currentTextToType.slice(1);
      }

      if (this.currentTextToType === "") {
        this.resetTyping();
        this.initTyping();
      }
    });
  }

  private initTyping() {
    if (this.currentLetter === "") {
      this.currentLetter = this.currentTextToType[0];
      this.currentTextToType = this.currentTextToType.slice(1);
    }
  }

  private resetTyping() {
    this.typedText = "";
    this.currentLetter = "";
    this.currentTextToType = "hello we are typing";
  }
}
