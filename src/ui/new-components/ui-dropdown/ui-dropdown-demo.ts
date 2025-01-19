import { UiDropdown } from "./ui-dropdown";

export class UiDropdownDemo {
  public message = "ui-dropdown-demo";

  // Example 1: Default Dropdown
  public defaultDropdown = `
    <ui-dropdown></ui-dropdown>
  `;

  // Example 2: Small Dropdown
  public smallDropdown = `
    <ui-dropdown size="sm"></ui-dropdown>
  `;

  // Example 3: Large Dropdown
  public largeDropdown = `
    <ui-dropdown size="lg"></ui-dropdown>
  `;

  // Example 4: Dropdown with Top Position
  public topDropdown = `
    <ui-dropdown position="top"></ui-dropdown>
  `;

  // Example 5: Dropdown with Left Position
  public leftDropdown = `
    <ui-dropdown position="left"></ui-dropdown>
  `;

  // Example 6: Dropdown with Right Position
  public rightDropdown = `
    <ui-dropdown position="right"></ui-dropdown>
  `;
}
