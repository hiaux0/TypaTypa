import { UiCombobox } from "./ui-combobox";

export class UiComboboxDemo {
  public message = "ui-combobox-demo";

  // Example 1: Default Combobox
  public defaultCombobox = `
    <ui-combobox></ui-combobox>
  `;

  // Example 2: Small Combobox
  public smallCombobox = `
    <ui-combobox size="sm"></ui-combobox>
  `;

  // Example 3: Large Combobox
  public largeCombobox = `
    <ui-combobox size="lg"></ui-combobox>
  `;

  // Example 4: Combobox with Top Position
  public topCombobox = `
    <ui-combobox position="top"></ui-combobox>
  `;

  // Example 5: Combobox with Left Position
  public leftCombobox = `
    <ui-combobox position="left"></ui-combobox>
  `;

  // Example 6: Combobox with Right Position
  public rightCombobox = `
    <ui-combobox position="right"></ui-combobox>
  `;
}
