import { UiSelect } from "./ui-select";

export class UiSelectDemo {
  public message = "ui-select-demo";

  // Example 1: Default Select
  public defaultSelect = `
    <ui-select></ui-select>
  `;

  // Example 2: Small Select
  public smallSelect = `
    <ui-select size="sm"></ui-select>
  `;

  // Example 3: Large Select
  public largeSelect = `
    <ui-select size="lg"></ui-select>
  `;

  // Example 4: Primary Select
  public primarySelect = `
    <ui-select color="primary"></ui-select>
  `;

  // Example 5: Secondary Select
  public secondarySelect = `
    <ui-select color="secondary"></ui-select>
  `;

  // Example 6: Destructive Select
  public destructiveSelect = `
    <ui-select color="destructive"></ui-select>
  `;
}
