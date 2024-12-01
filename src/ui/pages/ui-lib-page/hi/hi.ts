import './hi.scss';

export class Hi {
  public message = "hi.html";
  attaching() {
    console.log("hi attaching");
  }
  attached() {
    console.log("hi attaching");
  }
  activate() {
    console.log("hi attached");
  }
}
