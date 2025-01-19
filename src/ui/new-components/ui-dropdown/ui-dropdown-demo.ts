import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Dropdown</h2>
    <ui-dropdown></ui-dropdown>

    <h2>Small Dropdown</h2>
    <ui-dropdown size="sm"></ui-dropdown>

    <h2>Large Dropdown</h2>
    <ui-dropdown size="lg"></ui-dropdown>

    <h2>Dropdown with Top Position</h2>
    <ui-dropdown position="top"></ui-dropdown>

    <h2>Dropdown with Left Position</h2>
    <ui-dropdown position="left"></ui-dropdown>

    <h2>Dropdown with Right Position</h2>
    <ui-dropdown position="right"></ui-dropdown>
  </div>
`;

@customElement({ name: "ui-dropdown-demo", template })
export class UiDropdownDemo {}
