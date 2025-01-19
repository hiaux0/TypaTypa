import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Scroll Area</h2>
    <ui-scroll-area>
      <div>Default Scroll Area Content</div>
    </ui-scroll-area>

    <h2>Small Scroll Area</h2>
    <ui-scroll-area size="sm">
      <div>Small Scroll Area Content</div>
    </ui-scroll-area>

    <h2>Large Scroll Area</h2>
    <ui-scroll-area size="lg">
      <div>Large Scroll Area Content</div>
    </ui-scroll-area>

    <h2>Primary Scroll Area</h2>
    <ui-scroll-area color="primary">
      <div>Primary Scroll Area Content</div>
    </ui-scroll-area>

    <h2>Secondary Scroll Area</h2>
    <ui-scroll-area color="secondary">
      <div>Secondary Scroll Area Content</div>
    </ui-scroll-area>

    <h2>Destructive Scroll Area</h2>
    <ui-scroll-area color="destructive">
      <div>Destructive Scroll Area Content</div>
    </ui-scroll-area>
  </div>
`;

@customElement({ name: "ui-scroll-area-demo", template })
export class UiScrollAreaDemo {}
