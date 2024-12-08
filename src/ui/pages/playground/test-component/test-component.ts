import { bindable } from "aurelia";
import "./test-component.scss";

export class TestComponent {
  @bindable text: string;
  public message = "test-component.html";
}
