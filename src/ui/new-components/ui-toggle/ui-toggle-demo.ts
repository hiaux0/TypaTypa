import { UiToggle } from "./ui-toggle";

export class UiToggleDemo {
  public message = "ui-toggle-demo";

  // Example 1: Default Toggle
  public defaultToggle = `
    <ui-toggle></ui-toggle>
  `;

  // Example 2: Primary Toggle
  public primaryToggle = `
    <ui-toggle color="primary"></ui-toggle>
  `;

  // Example 3: Secondary Toggle
  public secondaryToggle = `
    <ui-toggle color="secondary"></ui-toggle>
  `;

  // Example 4: Destructive Toggle
  public destructiveToggle = `
    <ui-toggle color="destructive"></ui-toggle>
  `;

  // Example 5: Disabled Toggle
  public disabledToggle = `
    <ui-toggle disabled="true"></ui-toggle>
  `;
}
