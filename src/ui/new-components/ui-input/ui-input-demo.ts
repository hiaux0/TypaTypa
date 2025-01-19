import { UiInput } from "./ui-input";

export class UiInputDemo {
  public message = "ui-input-demo";

  // Example 1: Default Input
  public defaultInput = `
    <ui-input></ui-input>
  `;

  // Example 2: Destructive Input
  public destructiveInput = `
    <ui-input variant="destructive"></ui-input>
  `;

  // Example 3: Outline Input
  public outlineInput = `
    <ui-input variant="outline"></ui-input>
  `;

  // Example 4: Secondary Input
  public secondaryInput = `
    <ui-input variant="secondary"></ui-input>
  `;

  // Example 5: Ghost Input
  public ghostInput = `
    <ui-input variant="ghost"></ui-input>
  `;

  // Example 6: Link Input
  public linkInput = `
    <ui-input variant="link"></ui-input>
  `;

  // Example 7: Small Input
  public smallInput = `
    <ui-input size="sm"></ui-input>
  `;

  // Example 8: Large Input
  public largeInput = `
    <ui-input size="lg"></ui-input>
  `;
}
