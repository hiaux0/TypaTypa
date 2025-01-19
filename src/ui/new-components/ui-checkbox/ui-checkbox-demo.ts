import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Checkbox</h2>
    <ui-checkbox></ui-checkbox>

    <h2>Small Checkbox</h2>
    <ui-checkbox size="sm"></ui-checkbox>

    <h2>Large Checkbox</h2>
    <ui-checkbox size="lg"></ui-checkbox>

    <h2>Disabled Checkbox</h2>
    <ui-checkbox disabled="true"></ui-checkbox>
  </div>
`;

@customElement({ name: "ui-checkbox-demo", template })
export class UiCheckboxDemo {}
