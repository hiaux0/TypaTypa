import { UiCard } from "./ui-card";

export class UiCardDemo {
  public message = "ui-card-demo";

  // Example 1: Default Card
  public defaultCard = `
    <ui-card>
      <div>Default Card Content</div>
    </ui-card>
  `;

  // Example 2: Primary Card
  public primaryCard = `
    <ui-card variant="primary">
      <div>Primary Card Content</div>
    </ui-card>
  `;

  // Example 3: Secondary Card
  public secondaryCard = `
    <ui-card variant="secondary">
      <div>Secondary Card Content</div>
    </ui-card>
  `;

  // Example 4: Destructive Card
  public destructiveCard = `
    <ui-card variant="destructive">
      <div>Destructive Card Content</div>
    </ui-card>
  `;
}
