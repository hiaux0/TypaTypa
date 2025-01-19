import { UiBreadcrumb } from "./ui-breadcrumb";

export class UiBreadcrumbDemo {
  public message = "ui-breadcrumb-demo";

  // Example 1: Default Breadcrumb
  public defaultBreadcrumb = `
    <ui-breadcrumb items.bind="[{ label: 'Home', href: '/' }, { label: 'Library', href: '/library' }, { label: 'Data', href: '/library/data' }]">
    </ui-breadcrumb>
  `;

  // Example 2: Primary Breadcrumb
  public primaryBreadcrumb = `
    <ui-breadcrumb color="primary" items.bind="[{ label: 'Home', href: '/' }, { label: 'Library', href: '/library' }, { label: 'Data', href: '/library/data' }]">
    </ui-breadcrumb>
  `;

  // Example 3: Secondary Breadcrumb
  public secondaryBreadcrumb = `
    <ui-breadcrumb color="secondary" items.bind="[{ label: 'Home', href: '/' }, { label: 'Library', href: '/library' }, { label: 'Data', href: '/library/data' }]">
    </ui-breadcrumb>
  `;

  // Example 4: Destructive Breadcrumb
  public destructiveBreadcrumb = `
    <ui-breadcrumb color="destructive" items.bind="[{ label: 'Home', href: '/' }, { label: 'Library', href: '/library' }, { label: 'Data', href: '/library/data' }]">
    </ui-breadcrumb>
  `;
}
