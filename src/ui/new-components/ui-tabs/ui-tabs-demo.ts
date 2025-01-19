import { UiTabs } from "./ui-tabs";

export class UiTabsDemo {
  public message = "ui-tabs-demo";

  // Example 1: Default Tabs
  public defaultTabs = `
    <ui-tabs>
      <div>Tab 1</div>
      <div>Tab 2</div>
    </ui-tabs>
  `;

  // Example 2: Destructive Tabs
  public destructiveTabs = `
    <ui-tabs variant="destructive">
      <div>Destructive Tab 1</div>
      <div>Destructive Tab 2</div>
    </ui-tabs>
  `;

  // Example 3: Outline Tabs
  public outlineTabs = `
    <ui-tabs variant="outline">
      <div>Outline Tab 1</div>
      <div>Outline Tab 2</div>
    </ui-tabs>
  `;

  // Example 4: Secondary Tabs
  public secondaryTabs = `
    <ui-tabs variant="secondary">
      <div>Secondary Tab 1</div>
      <div>Secondary Tab 2</div>
    </ui-tabs>
  `;

  // Example 5: Ghost Tabs
  public ghostTabs = `
    <ui-tabs variant="ghost">
      <div>Ghost Tab 1</div>
      <div>Ghost Tab 2</div>
    </ui-tabs>
  `;

  // Example 6: Link Tabs
  public linkTabs = `
    <ui-tabs variant="link">
      <div>Link Tab 1</div>
      <div>Link Tab 2</div>
    </ui-tabs>
  `;

  // Example 7: Small Tabs
  public smallTabs = `
    <ui-tabs size="sm">
      <div>Small Tab 1</div>
      <div>Small Tab 2</div>
    </ui-tabs>
  `;

  // Example 8: Large Tabs
  public largeTabs = `
    <ui-tabs size="lg">
      <div>Large Tab 1</div>
      <div>Large Tab 2</div>
    </ui-tabs>
  `;

  // Example 9: Icon Tabs
  public iconTabs = `
    <ui-tabs size="icon">
      <div>Icon Tab 1</div>
      <div>Icon Tab 2</div>
    </ui-tabs>
  `;
}
