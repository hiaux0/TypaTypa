import { UiPopover } from "./ui-popover";

export class UiPopoverDemo {
  public message = "ui-popover-demo";

  // Example 1: Default Popover
  public defaultPopover = `
    <ui-popover text="Default Popover"></ui-popover>
  `;

  // Example 2: Popover with Bottom Position
  public bottomPopover = `
    <ui-popover text="Bottom Popover" position="bottom"></ui-popover>
  `;

  // Example 3: Popover with Left Position
  public leftPopover = `
    <ui-popover text="Left Popover" position="left"></ui-popover>
  `;

  // Example 4: Popover with Right Position
  public rightPopover = `
    <ui-popover text="Right Popover" position="right"></ui-popover>
  `;
}
