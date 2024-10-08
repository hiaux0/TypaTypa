export function downloadText(content: unknown, fileName = "typing-app"): void {
  function getCurrentDate() {
    const date = new Date();
    const dateString = date.toISOString();
    return dateString;
  }

  function download(content: string, fileName: string) {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`,
    );
    element.setAttribute("download", `${fileName}.json`);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  const stringify = JSON.stringify(content, null, 4);
  const finalFileName = `${getCurrentDate()}-${fileName}`;
  download(stringify, finalFileName);
}
