import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Breadcrumb</h2>
    <ui-breadcrumb items.bind="[{ label: 'Home', href: '/' }, { label: 'Library', href: '/library' }, { label: 'Data', href: '/library/data' }]">
    </ui-breadcrumb>

    <h2>Primary Breadcrumb</h2>
    <ui-breadcrumb color="primary" items.bind="[{ label: 'Home', href: '/' }, { label: 'Library', href: '/library' }, { label: 'Data', href: '/library/data' }]">
    </ui-breadcrumb>

    <h2>Secondary Breadcrumb</h2>
    <ui-breadcrumb color="secondary" items.bind="[{ label: 'Home', href: '/' }, { label: 'Library', href: '/library' }, { label: 'Data', href: '/library/data' }]">
    </ui-breadcrumb>

    <h2>Destructive Breadcrumb</h2>
    <ui-breadcrumb color="destructive" items.bind="[{ label: 'Home', href: '/' }, { label: 'Library', href: '/library' }, { label: 'Data', href: '/library/data' }]">
    </ui-breadcrumb>
  </div>
`;

@customElement({ name: "ui-breadcrumb-demo", template })
export class UiBreadcrumbDemo {}
