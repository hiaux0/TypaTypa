import { UiRadioGroup } from "./ui-radio-group";

export class UiRadioGroupDemo {
  public message = "ui-radio-group-demo";

  // Example 1: Default Radio Group
  public defaultRadioGroup = `
    <ui-radio-group>
      <div>Radio Group Item 1</div>
      <div>Radio Group Item 2</div>
    </ui-radio-group>
  `;

  // Example 2: Horizontal Radio Group
  public horizontalRadioGroup = `
    <ui-radio-group direction="horizontal">
      <div>Horizontal Radio Group Item 1</div>
      <div>Horizontal Radio Group Item 2</div>
    </ui-radio-group>
  `;

  // Example 3: Vertical Radio Group
  public verticalRadioGroup = `
    <ui-radio-group direction="vertical">
      <div>Vertical Radio Group Item 1</div>
      <div>Vertical Radio Group Item 2</div>
    </ui-radio-group>
  `;
}
