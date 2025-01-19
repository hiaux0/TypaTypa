import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Separator</h2>
    <ui-separator></ui-separator>

    <h2>Primary Separator</h2>
    <ui-separator color="primary"></ui-separator>

    <h2>Secondary Separator</h2>
    <ui-separator color="secondary"></ui-separator>

    <h2>Destructive Separator</h2>
    <ui-separator color="destructive"></ui-separator>
  </div>
`;

@customElement({ name: "ui-separator-demo", template })
export class UiSeparatorDemo {}
