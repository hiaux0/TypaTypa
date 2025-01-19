import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Tooltip</h2>
    <ui-tooltip text="Default Tooltip"></ui-tooltip>

    <h2>Tooltip with Bottom Position</h2>
    <ui-tooltip text="Bottom Tooltip" position="bottom"></ui-tooltip>

    <h2>Tooltip with Left Position</h2>
    <ui-tooltip text="Left Tooltip" position="left"></ui-tooltip>

    <h2>Tooltip with Right Position</h2>
    <ui-tooltip text="Right Tooltip" position="right"></ui-tooltip>
  </div>
`;

@customElement({ name: "ui-tooltip-demo", template })
export class UiTooltipDemo {}
