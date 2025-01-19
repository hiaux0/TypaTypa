import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Toggle</h2>
    <ui-toggle></ui-toggle>

    <h2>Primary Toggle</h2>
    <ui-toggle color="primary"></ui-toggle>

    <h2>Secondary Toggle</h2>
    <ui-toggle color="secondary"></ui-toggle>

    <h2>Destructive Toggle</h2>
    <ui-toggle color="destructive"></ui-toggle>

    <h2>Disabled Toggle</h2>
    <ui-toggle disabled="true"></ui-toggle>
  </div>
`;

@customElement({ name: "ui-toggle-demo", template })
export class UiToggleDemo {}
