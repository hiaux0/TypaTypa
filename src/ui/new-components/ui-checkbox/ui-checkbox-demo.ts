import { UiCheckbox } from "./ui-checkbox";

export class UiCheckboxDemo {
  public message = "ui-checkbox-demo";

  // Example 1: Default Checkbox
  public defaultCheckbox = `
    <ui-checkbox></ui-checkbox>
  `;

  // Example 2: Small Checkbox
  public smallCheckbox = `
    <ui-checkbox size="sm"></ui-checkbox>
  `;

  // Example 3: Large Checkbox
  public largeCheckbox = `
    <ui-checkbox size="lg"></ui-checkbox>
  `;

  // Example 4: Disabled Checkbox
  public disabledCheckbox = `
    <ui-checkbox disabled="true"></ui-checkbox>
  `;
}
