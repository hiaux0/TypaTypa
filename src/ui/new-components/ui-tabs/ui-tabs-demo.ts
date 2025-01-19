import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Tabs</h2>
    <ui-tabs>
      <div>Tab 1</div>
      <div>Tab 2</div>
    </ui-tabs>

    <h2>Destructive Tabs</h2>
    <ui-tabs variant="destructive">
      <div>Destructive Tab 1</div>
      <div>Destructive Tab 2</div>
    </ui-tabs>

    <h2>Outline Tabs</h2>
    <ui-tabs variant="outline">
      <div>Outline Tab 1</div>
      <div>Outline Tab 2</div>
    </ui-tabs>

    <h2>Secondary Tabs</h2>
    <ui-tabs variant="secondary">
      <div>Secondary Tab 1</div>
      <div>Secondary Tab 2</div>
    </ui-tabs>

    <h2>Ghost Tabs</h2>
    <ui-tabs variant="ghost">
      <div>Ghost Tab 1</div>
      <div>Ghost Tab 2</div>
    </ui-tabs>

    <h2>Link Tabs</h2>
    <ui-tabs variant="link">
      <div>Link Tab 1</div>
      <div>Link Tab 2</div>
    </ui-tabs>

    <h2>Small Tabs</h2>
    <ui-tabs size="sm">
      <div>Small Tab 1</div>
      <div>Small Tab 2</div>
    </ui-tabs>

    <h2>Large Tabs</h2>
    <ui-tabs size="lg">
      <div>Large Tab 1</div>
      <div>Large Tab 2</div>
    </ui-tabs>

    <h2>Icon Tabs</h2>
    <ui-tabs size="icon">
      <div>Icon Tab 1</div>
      <div>Icon Tab 2</div>
    </ui-tabs>
  </div>
`;

@customElement({ name: "ui-tabs-demo", template })
export class UiTabsDemo {}
