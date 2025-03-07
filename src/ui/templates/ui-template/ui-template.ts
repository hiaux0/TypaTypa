// ui-{{name}}
import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const {{name}}Variants = cva();

const template = `
  <button
  </button>
`;

@customElement({
  name: "ui-{{name}}",
  template,
})
export class Ui{{pascalCase name}} {
}
