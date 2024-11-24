import "./playground.scss";

export class Playground {
  public message = "playground.html";
  public inputRef;
  public pastedHtml = "";

  attached() {
    this.inputRef.addEventListener("paste", (e) => {
      e.preventDefault();

      // Get the raw pasted HTML
      var html = (e.originalEvent || e).clipboardData.getData("text/html");

      // Log it to the console
      console.log(html);
      this.pastedHtml = html;
    });
  }

  generatedClipboardRawRead() {
    const rawRead = navigator.clipboard.read();
    console.log("rawRead", rawRead);
  }
}
