import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Textarea</h2>
    <ui-textarea></ui-textarea>

    <h2>Destructive Textarea</h2>
    <ui-textarea variant="destructive"></ui-textarea>

    <h2>Outline Textarea</h2>
    <ui-textarea variant="outline"></ui-textarea>

    <h2>Secondary Textarea</h2>
    <ui-textarea variant="secondary"></ui-textarea>

    <h2>Small Textarea</h2>
    <ui-textarea size="sm"></ui-textarea>

    <h2>Large Textarea</h2>
    <ui-textarea size="lg"></ui-textarea>
  </div>
`;

@customElement({ name: "ui-textarea-demo", template })
export class UiTextareaDemo {}
