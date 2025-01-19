import { UiSheet } from "./ui-sheet";

export class UiSheetDemo {
  public message = "ui-sheet-demo";

  // Example 1: Default Sheet
  public defaultSheet = `
    <ui-sheet>
      <div>Default Sheet Content</div>
    </ui-sheet>
  `;

  // Example 2: Small Sheet
  public smallSheet = `
    <ui-sheet size="sm">
      <div>Small Sheet Content</div>
    </ui-sheet>
  `;

  // Example 3: Large Sheet
  public largeSheet = `
    <ui-sheet size="lg">
      <div>Large Sheet Content</div>
    </ui-sheet>
  `;

  // Example 4: Sheet without Backdrop
  public noBackdropSheet = `
    <ui-sheet backdrop="none">
      <div>Sheet without Backdrop Content</div>
    </ui-sheet>
  `;
}
