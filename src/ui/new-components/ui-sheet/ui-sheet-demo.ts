import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Sheet</h2>
    <ui-sheet>
      <div>Default Sheet Content</div>
    </ui-sheet>

    <h2>Small Sheet</h2>
    <ui-sheet size="sm">
      <div>Small Sheet Content</div>
    </ui-sheet>

    <h2>Large Sheet</h2>
    <ui-sheet size="lg">
      <div>Large Sheet Content</div>
    </ui-sheet>

    <h2>Sheet without Backdrop</h2>
    <ui-sheet backdrop="none">
      <div>Sheet without Backdrop Content</div>
    </ui-sheet>
  </div>
`;

@customElement({ name: "ui-sheet-demo", template })
export class UiSheetDemo {}
