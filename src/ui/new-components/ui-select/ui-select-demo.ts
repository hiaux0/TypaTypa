import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Select</h2>
    <ui-select></ui-select>

    <h2>Small Select</h2>
    <ui-select size="sm"></ui-select>

    <h2>Large Select</h2>
    <ui-select size="lg"></ui-select>

    <h2>Primary Select</h2>
    <ui-select color="primary"></ui-select>

    <h2>Secondary Select</h2>
    <ui-select color="secondary"></ui-select>

    <h2>Destructive Select</h2>
    <ui-select color="destructive"></ui-select>
  </div>
`;

@customElement({ name: "ui-select-demo", template })
export class UiSelectDemo {}
