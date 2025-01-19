import { UiProgress } from "./ui-progress";

export class UiProgressDemo {
  public message = "ui-progress-demo";

  // Example 1: Default Progress
  public defaultProgress = `
    <ui-progress value="50"></ui-progress>
  `;

  // Example 2: Secondary Progress
  public secondaryProgress = `
    <ui-progress value="75" color="secondary"></ui-progress>
  `;

  // Example 3: Destructive Progress
  public destructiveProgress = `
    <ui-progress value="25" color="destructive"></ui-progress>
  `;

  // Example 4: Progress with 100% Value
  public fullProgress = `
    <ui-progress value="100"></ui-progress>
  `;
}
