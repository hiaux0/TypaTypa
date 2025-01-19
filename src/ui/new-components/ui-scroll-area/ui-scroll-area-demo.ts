import { UiScrollArea } from "./ui-scroll-area";

export class UiScrollAreaDemo {
  public message = "ui-scroll-area-demo";

  // Example 1: Default Scroll Area
  public defaultScrollArea = `
    <ui-scroll-area>
      <div>Default Scroll Area Content</div>
    </ui-scroll-area>
  `;

  // Example 2: Small Scroll Area
  public smallScrollArea = `
    <ui-scroll-area size="sm">
      <div>Small Scroll Area Content</div>
    </ui-scroll-area>
  `;

  // Example 3: Large Scroll Area
  public largeScrollArea = `
    <ui-scroll-area size="lg">
      <div>Large Scroll Area Content</div>
    </ui-scroll-area>
  `;

  // Example 4: Primary Scroll Area
  public primaryScrollArea = `
    <ui-scroll-area color="primary">
      <div>Primary Scroll Area Content</div>
    </ui-scroll-area>
  `;

  // Example 5: Secondary Scroll Area
  public secondaryScrollArea = `
    <ui-scroll-area color="secondary">
      <div>Secondary Scroll Area Content</div>
    </ui-scroll-area>
  `;

  // Example 6: Destructive Scroll Area
  public destructiveScrollArea = `
    <ui-scroll-area color="destructive">
      <div>Destructive Scroll Area Content</div>
    </ui-scroll-area>
  `;
}
