import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Label</h2>
    <ui-label>Default Label</ui-label>

    <h2>Primary Label</h2>
    <ui-label variant="primary">Primary Label</ui-label>

    <h2>Secondary Label</h2>
    <ui-label variant="secondary">Secondary Label</ui-label>

    <h2>Destructive Label</h2>
    <ui-label variant="destructive">Destructive Label</ui-label>

    <h2>Label with Top Position</h2>
    <ui-label position="top">Top Label</ui-label>

    <h2>Label with Left Position</h2>
    <ui-label position="left">Left Label</ui-label>

    <h2>Label with Right Position</h2>
    <ui-label position="right">Right Label</ui-label>
  </div>
`;

@customElement({ name: "ui-label-demo", template })
export class UiLabelDemo {}
