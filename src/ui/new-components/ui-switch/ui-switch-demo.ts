import { UiSwitch } from "./ui-switch";

export class UiSwitchDemo {
  public message = "ui-switch-demo";

  // Example 1: Default Switch
  public defaultSwitch = `
    <ui-switch></ui-switch>
  `;

  // Example 2: Primary Switch
  public primarySwitch = `
    <ui-switch color="primary"></ui-switch>
  `;

  // Example 3: Secondary Switch
  public secondarySwitch = `
    <ui-switch color="secondary"></ui-switch>
  `;

  // Example 4: Destructive Switch
  public destructiveSwitch = `
    <ui-switch color="destructive"></ui-switch>
  `;

  // Example 5: Disabled Switch
  public disabledSwitch = `
    <ui-switch disabled="true"></ui-switch>
  `;
}
