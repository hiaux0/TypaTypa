import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Hover Card</h2>
    <ui-hover-card text="Default Hover Card"></ui-hover-card>

    <h2>Hover Card with Bottom Position</h2>
    <ui-hover-card text="Bottom Hover Card" position="bottom"></ui-hover-card>

    <h2>Hover Card with Left Position</h2>
    <ui-hover-card text="Left Hover Card" position="left"></ui-hover-card>

    <h2>Hover Card with Right Position</h2>
    <ui-hover-card text="Right Hover Card" position="right"></ui-hover-card>
  </div>
`;

@customElement({ name: "ui-hover-card-demo", template })
export class UiHoverCardDemo {}
