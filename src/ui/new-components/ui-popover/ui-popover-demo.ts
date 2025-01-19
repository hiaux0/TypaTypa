import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Popover</h2>
    <ui-popover text="Default Popover"></ui-popover>

    <h2>Popover with Bottom Position</h2>
    <ui-popover text="Bottom Popover" position="bottom"></ui-popover>

    <h2>Popover with Left Position</h2>
    <ui-popover text="Left Popover" position="left"></ui-popover>

    <h2>Popover with Right Position</h2>
    <ui-popover text="Right Popover" position="right"></ui-popover>
  </div>
`;

@customElement({ name: "ui-popover-demo", template })
export class UiPopoverDemo {}
