import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Combobox</h2>
    <ui-combobox></ui-combobox>

    <h2>Small Combobox</h2>
    <ui-combobox size="sm"></ui-combobox>

    <h2>Large Combobox</h2>
    <ui-combobox size="lg"></ui-combobox>

    <h2>Combobox with Top Position</h2>
    <ui-combobox position="top"></ui-combobox>

    <h2>Combobox with Left Position</h2>
    <ui-combobox position="left"></ui-combobox>

    <h2>Combobox with Right Position</h2>
    <ui-combobox position="right"></ui-combobox>
  </div>
`;

@customElement({ name: "ui-combobox-demo", template })
export class UiComboboxDemo {}
