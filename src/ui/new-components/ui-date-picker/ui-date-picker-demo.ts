import { UiDatePicker } from "./ui-date-picker";

export class UiDatePickerDemo {
  public message = "ui-date-picker-demo";

  // Example 1: Default Date Picker
  public defaultDatePicker = `
    <ui-date-picker></ui-date-picker>
  `;

  // Example 2: Small Date Picker
  public smallDatePicker = `
    <ui-date-picker size="sm"></ui-date-picker>
  `;

  // Example 3: Large Date Picker
  public largeDatePicker = `
    <ui-date-picker size="lg"></ui-date-picker>
  `;

  // Example 4: Date Picker with Top Position
  public topDatePicker = `
    <ui-date-picker position="top"></ui-date-picker>
  `;

  // Example 5: Date Picker with Left Position
  public leftDatePicker = `
    <ui-date-picker position="left"></ui-date-picker>
  `;

  // Example 6: Date Picker with Right Position
  public rightDatePicker = `
    <ui-date-picker position="right"></ui-date-picker>
  `;
}
