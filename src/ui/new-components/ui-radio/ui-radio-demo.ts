import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Radio</h2>
    <ui-radio></ui-radio>

    <h2>Small Radio</h2>
    <ui-radio size="sm"></ui-radio>

    <h2>Large Radio</h2>
    <ui-radio size="lg"></ui-radio>

    <h2>Disabled Radio</h2>
    <ui-radio disabled="true"></ui-radio>
  </div>
`;

@customElement({ name: "ui-radio-demo", template })
export class UiRadioDemo {}
