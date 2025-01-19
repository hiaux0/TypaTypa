import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Calendar</h2>
    <ui-calendar>
      <div>Default Calendar Content</div>
    </ui-calendar>

    <h2>Destructive Calendar</h2>
    <ui-calendar variant="destructive">
      <div>Destructive Calendar Content</div>
    </ui-calendar>

    <h2>Outline Calendar</h2>
    <ui-calendar variant="outline">
      <div>Outline Calendar Content</div>
    </ui-calendar>

    <h2>Secondary Calendar</h2>
    <ui-calendar variant="secondary">
      <div>Secondary Calendar Content</div>
    </ui-calendar>

    <h2>Ghost Calendar</h2>
    <ui-calendar variant="ghost">
      <div>Ghost Calendar Content</div>
    </ui-calendar>
  </div>
`;

@customElement({ name: "ui-calendar-demo", template })
export class UiCalendarDemo {}
