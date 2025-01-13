// ui-template
import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const template Variants = cva();

const template = `
  <button
  </button>
`;

@customElement({
  name: "ui-template",
  template,
})
export class ui-template {
}
