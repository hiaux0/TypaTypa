import { UiRadio } from "./ui-radio";

export class UiRadioDemo {
  public message = "ui-radio-demo";

  // Example 1: Default Radio
  public defaultRadio = `
    <ui-radio></ui-radio>
  `;

  // Example 2: Small Radio
  public smallRadio = `
    <ui-radio size="sm"></ui-radio>
  `;

  // Example 3: Large Radio
  public largeRadio = `
    <ui-radio size="lg"></ui-radio>
  `;

  // Example 4: Disabled Radio
  public disabledRadio = `
    <ui-radio disabled="true"></ui-radio>
  `;
}
