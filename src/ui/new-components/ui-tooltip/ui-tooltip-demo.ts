import { UiTooltip } from "./ui-tooltip";

export class UiTooltipDemo {
  public message = "ui-tooltip-demo";

  // Example 1: Default Tooltip
  public defaultTooltip = `
    <ui-tooltip text="Default Tooltip"></ui-tooltip>
  `;

  // Example 2: Tooltip with Bottom Position
  public bottomTooltip = `
    <ui-tooltip text="Bottom Tooltip" position="bottom"></ui-tooltip>
  `;

  // Example 3: Tooltip with Left Position
  public leftTooltip = `
    <ui-tooltip text="Left Tooltip" position="left"></ui-tooltip>
  `;

  // Example 4: Tooltip with Right Position
  public rightTooltip = `
    <ui-tooltip text="Right Tooltip" position="right"></ui-tooltip>
  `;
}
