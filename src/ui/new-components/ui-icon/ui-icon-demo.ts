import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Icon</h2>
    <ui-icon></ui-icon>

    <h2>Small Icon</h2>
    <ui-icon size="sm"></ui-icon>

    <h2>Large Icon</h2>
    <ui-icon size="lg"></ui-icon>

    <h2>Primary Icon</h2>
    <ui-icon color="primary"></ui-icon>

    <h2>Secondary Icon</h2>
    <ui-icon color="secondary"></ui-icon>

    <h2>Destructive Icon</h2>
    <ui-icon color="destructive"></ui-icon>
  </div>
`;

@customElement({ name: "ui-icon-demo", template })
export class UiIconDemo {}
