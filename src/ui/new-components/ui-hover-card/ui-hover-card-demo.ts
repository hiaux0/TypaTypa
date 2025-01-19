import { UiHoverCard } from "./ui-hover-card";

export class UiHoverCardDemo {
  public message = "ui-hover-card-demo";

  // Example 1: Default Hover Card
  public defaultHoverCard = `
    <ui-hover-card text="Default Hover Card"></ui-hover-card>
  `;

  // Example 2: Hover Card with Bottom Position
  public bottomHoverCard = `
    <ui-hover-card text="Bottom Hover Card" position="bottom"></ui-hover-card>
  `;

  // Example 3: Hover Card with Left Position
  public leftHoverCard = `
    <ui-hover-card text="Left Hover Card" position="left"></ui-hover-card>
  `;

  // Example 4: Hover Card with Right Position
  public rightHoverCard = `
    <ui-hover-card text="Right Hover Card" position="right"></ui-hover-card>
  `;
}
