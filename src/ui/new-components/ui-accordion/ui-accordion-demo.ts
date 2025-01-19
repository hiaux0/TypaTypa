import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Accordion</h2>
    <ui-accordion>
      <div>Accordion Content 1</div>
      <div>Accordion Content 2</div>
    </ui-accordion>

    <h2>Primary Accordion</h2>
    <ui-accordion variant="primary">
      <div>Primary Accordion Content 1</div>
      <div>Primary Accordion Content 2</div>
    </ui-accordion>

    <h2>Secondary Accordion</h2>
    <ui-accordion variant="secondary">
      <div>Secondary Accordion Content 1</div>
      <div>Secondary Accordion Content 2</div>
    </ui-accordion>

    <h2>Destructive Accordion</h2>
    <ui-accordion variant="destructive">
      <div>Destructive Accordion Content 1</div>
      <div>Destructive Accordion Content 2</div>
    </ui-accordion>
  </div>
`;

@customElement({ name: "ui-accordion-demo", template })
export class UiAccordionDemo {}
