import { UiCalendar } from "./ui-calendar";

export class UiCalendarDemo {
  public message = "ui-calendar-demo";

  // Example 1: Default Calendar
  public defaultCalendar = `
    <ui-calendar>
      <div>Default Calendar Content</div>
    </ui-calendar>
  `;

  // Example 2: Destructive Calendar
  public destructiveCalendar = `
    <ui-calendar variant="destructive">
      <div>Destructive Calendar Content</div>
    </ui-calendar>
  `;

  // Example 3: Outline Calendar
  public outlineCalendar = `
    <ui-calendar variant="outline">
      <div>Outline Calendar Content</div>
    </ui-calendar>
  `;

  // Example 4: Secondary Calendar
  public secondaryCalendar = `
    <ui-calendar variant="secondary">
      <div>Secondary Calendar Content</div>
    </ui-calendar>
  `;

  // Example 5: Ghost Calendar
  public ghostCalendar = `
    <ui-calendar variant="ghost">
      <div>Ghost Calendar Content</div>
    </ui-calendar>
  `;
}
