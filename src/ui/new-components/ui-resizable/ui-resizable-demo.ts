import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Resizable</h2>
    <ui-resizable>
      <div>Default Resizable Content</div>
    </ui-resizable>

    <h2>Small Resizable</h2>
    <ui-resizable size="sm">
      <div>Small Resizable Content</div>
    </ui-resizable>

    <h2>Large Resizable</h2>
    <ui-resizable size="lg">
      <div>Large Resizable Content</div>
    </ui-resizable>

    <h2>Resizable with Top Position</h2>
    <ui-resizable position="top">
      <div>Top Resizable Content</div>
    </ui-resizable>

    <h2>Resizable with Left Position</h2>
    <ui-resizable position="left">
      <div>Left Resizable Content</div>
    </ui-resizable>

    <h2>Resizable with Right Position</h2>
    <ui-resizable position="right">
      <div>Right Resizable Content</div>
    </ui-resizable>
  </div>
`;

@customElement({ name: "ui-resizable-demo", template })
export class UiResizableDemo {}
