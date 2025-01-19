import { UiLabel } from "./ui-label";

export class UiLabelDemo {
  public message = "ui-label-demo";

  // Example 1: Default Label
  public defaultLabel = `
    <ui-label>Default Label</ui-label>
  `;

  // Example 2: Primary Label
  public primaryLabel = `
    <ui-label variant="primary">Primary Label</ui-label>
  `;

  // Example 3: Secondary Label
  public secondaryLabel = `
    <ui-label variant="secondary">Secondary Label</ui-label>
  `;

  // Example 4: Destructive Label
  public destructiveLabel = `
    <ui-label variant="destructive">Destructive Label</ui-label>
  `;

  // Example 5: Label with Top Position
  public topLabel = `
    <ui-label position="top">Top Label</ui-label>
  `;

  // Example 6: Label with Left Position
  public leftLabel = `
    <ui-label position="left">Left Label</ui-label>
  `;

  // Example 7: Label with Right Position
  public rightLabel = `
    <ui-label position="right">Right Label</ui-label>
  `;
}
