import { UiButton } from "./ui-button";

export class UiButtonDemo {
  public message = "ui-button-demo";

  // Example 1: Default Button
  public defaultButton = `
    <ui-button label="Default Button"></ui-button>
  `;

  // Example 2: Destructive Button
  public destructiveButton = `
    <ui-button label="Destructive Button" variant="destructive"></ui-button>
  `;

  // Example 3: Outline Button
  public outlineButton = `
    <ui-button label="Outline Button" variant="outline"></ui-button>
  `;

  // Example 4: Secondary Button
  public secondaryButton = `
    <ui-button label="Secondary Button" variant="secondary"></ui-button>
  `;

  // Example 5: Ghost Button
  public ghostButton = `
    <ui-button label="Ghost Button" variant="ghost"></ui-button>
  `;
}
