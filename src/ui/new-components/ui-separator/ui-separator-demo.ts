import { UiSeparator } from "./ui-separator";

export class UiSeparatorDemo {
  public message = "ui-separator-demo";

  // Example 1: Default Separator
  public defaultSeparator = `
    <ui-separator></ui-separator>
  `;

  // Example 2: Primary Separator
  public primarySeparator = `
    <ui-separator color="primary"></ui-separator>
  `;

  // Example 3: Secondary Separator
  public secondarySeparator = `
    <ui-separator color="secondary"></ui-separator>
  `;

  // Example 4: Destructive Separator
  public destructiveSeparator = `
    <ui-separator color="destructive"></ui-separator>
  `;
}
