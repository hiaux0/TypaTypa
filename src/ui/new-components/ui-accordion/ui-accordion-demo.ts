import { UiAccordion } from "./ui-accordion";

export class UiAccordionDemo {
  public message = "ui-accordion-demo";

  // Example 1: Default Accordion
  public defaultAccordion = `
    <ui-accordion>
      <div>Accordion Content 1</div>
      <div>Accordion Content 2</div>
    </ui-accordion>
  `;

  // Example 2: Primary Accordion
  public primaryAccordion = `
    <ui-accordion variant="primary">
      <div>Primary Accordion Content 1</div>
      <div>Primary Accordion Content 2</div>
    </ui-accordion>
  `;

  // Example 3: Secondary Accordion
  public secondaryAccordion = `
    <ui-accordion variant="secondary">
      <div>Secondary Accordion Content 1</div>
      <div>Secondary Accordion Content 2</div>
    </ui-accordion>
  `;

  // Example 4: Destructive Accordion
  public destructiveAccordion = `
    <ui-accordion variant="destructive">
      <div>Destructive Accordion Content 1</div>
      <div>Destructive Accordion Content 2</div>
    </ui-accordion>
  `;
}
