import "./grid-test-page.scss";

export class GridTestPage {
  public message = "grid-test-page.html";
  public rowSize = 50;
  public columnSize = 30;

  public numberToAlphabet = (num: number) => {
    return String.fromCharCode(65 + num);
  };
}
