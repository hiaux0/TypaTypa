import { UiTextarea } from "./ui-textarea";

export class UiTextareaDemo {
  public message = "ui-textarea-demo";

  // Example 1: Default Textarea
  public defaultTextarea = `
    <ui-textarea></ui-textarea>
  `;

  // Example 2: Destructive Textarea
  public destructiveTextarea = `
    <ui-textarea variant="destructive"></ui-textarea>
  `;

  // Example 3: Outline Textarea
  public outlineTextarea = `
    <ui-textarea variant="outline"></ui-textarea>
  `;

  // Example 4: Secondary Textarea
  public secondaryTextarea = `
    <ui-textarea variant="secondary"></ui-textarea>
  `;

  // Example 5: Small Textarea
  public smallTextarea = `
    <ui-textarea size="sm"></ui-textarea>
  `;

  // Example 6: Large Textarea
  public largeTextarea = `
    <ui-textarea size="lg"></ui-textarea>
  `;
}
