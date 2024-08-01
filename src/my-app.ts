export class MyApp {
  public message = "Typing App cua Emy";
  public typedText = "Hello ";
  public currentLetter = "w";
  public currentTextToType = "we are typing";

  attached() {
    document.addEventListener("keydown", (event) => {
      const key = event.key
      /*prettier-ignore*/ console.log("[my-app.ts,8] key: ", key);
    });
  }
}
