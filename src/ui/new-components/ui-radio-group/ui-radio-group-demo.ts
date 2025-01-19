import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Radio Group</h2>
    <ui-radio-group>
      <div>Radio Group Item 1</div>
      <div>Radio Group Item 2</div>
    </ui-radio-group>

    <h2>Horizontal Radio Group</h2>
    <ui-radio-group direction="horizontal">
      <div>Horizontal Radio Group Item 1</div>
      <div>Horizontal Radio Group Item 2</div>
    </ui-radio-group>

    <h2>Vertical Radio Group</h2>
    <ui-radio-group direction="vertical">
      <div>Vertical Radio Group Item 1</div>
      <div>Vertical Radio Group Item 2</div>
    </ui-radio-group>
  </div>
`;

@customElement({ name: "ui-radio-group-demo", template })
export class UiRadioGroupDemo {}
