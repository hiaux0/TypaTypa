import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Switch</h2>
    <ui-switch></ui-switch>

    <h2>Primary Switch</h2>
    <ui-switch color="primary"></ui-switch>

    <h2>Secondary Switch</h2>
    <ui-switch color="secondary"></ui-switch>

    <h2>Destructive Switch</h2>
    <ui-switch color="destructive"></ui-switch>

    <h2>Disabled Switch</h2>
    <ui-switch disabled="true"></ui-switch>
  </div>
`;

@customElement({ name: "ui-switch-demo", template })
export class UiSwitchDemo {}
