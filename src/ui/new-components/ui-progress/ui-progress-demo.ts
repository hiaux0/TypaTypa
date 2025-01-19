import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Progress</h2>
    <ui-progress value="50"></ui-progress>

    <h2>Secondary Progress</h2>
    <ui-progress value="75" color="secondary"></ui-progress>

    <h2>Destructive Progress</h2>
    <ui-progress value="25" color="destructive"></ui-progress>

    <h2>Progress with 100% Value</h2>
    <ui-progress value="100"></ui-progress>
  </div>
`;

@customElement({ name: "ui-progress-demo", template })
export class UiProgressDemo {}
