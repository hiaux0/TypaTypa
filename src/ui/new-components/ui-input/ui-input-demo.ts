import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Input</h2>
    <ui-input></ui-input>

    <h2>Destructive Input</h2>
    <ui-input variant="destructive"></ui-input>

    <h2>Outline Input</h2>
    <ui-input variant="outline"></ui-input>

    <h2>Secondary Input</h2>
    <ui-input variant="secondary"></ui-input>

    <h2>Ghost Input</h2>
    <ui-input variant="ghost"></ui-input>

    <h2>Link Input</h2>
    <ui-input variant="link"></ui-input>

    <h2>Small Input</h2>
    <ui-input size="sm"></ui-input>

    <h2>Large Input</h2>
    <ui-input size="lg"></ui-input>
  </div>
`;

@customElement({ name: "ui-input-demo", template })
export class UiInputDemo {}
