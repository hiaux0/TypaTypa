import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Date Picker</h2>
    <ui-date-picker></ui-date-picker>

    <h2>Small Date Picker</h2>
    <ui-date-picker size="sm"></ui-date-picker>

    <h2>Large Date Picker</h2>
    <ui-date-picker size="lg"></ui-date-picker>

    <h2>Date Picker with Top Position</h2>
    <ui-date-picker position="top"></ui-date-picker>

    <h2>Date Picker with Left Position</h2>
    <ui-date-picker position="left"></ui-date-picker>

    <h2>Date Picker with Right Position</h2>
    <ui-date-picker position="right"></ui-date-picker>
  </div>
`;

@customElement({ name: "ui-date-picker-demo", template })
export class UiDatePickerDemo {}
