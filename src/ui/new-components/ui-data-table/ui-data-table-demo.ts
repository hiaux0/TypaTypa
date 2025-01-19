import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Data Table</h2>
    <ui-data-table columns.bind="columns" rows.bind="rows"></ui-data-table>

    <h2>Small Data Table</h2>
    <ui-data-table size="sm" columns.bind="columns" rows.bind="rows"></ui-data-table>

    <h2>Large Data Table</h2>
    <ui-data-table size="lg" columns.bind="columns" rows.bind="rows"></ui-data-table>

    <h2>Primary Data Table</h2>
    <ui-data-table color="primary" columns.bind="columns" rows.bind="rows"></ui-data-table>

    <h2>Secondary Data Table</h2>
    <ui-data-table color="secondary" columns.bind="columns" rows.bind="rows"></ui-data-table>

    <h2>Destructive Data Table</h2>
    <ui-data-table color="destructive" columns.bind="columns" rows.bind="rows"></ui-data-table>
  </div>
`;

@customElement({ name: "ui-data-table-demo", template })
export class UiDataTableDemo {
  public columns = [
    { label: "Name", field: "name" },
    { label: "Age", field: "age" },
    { label: "Email", field: "email" },
  ];

  public rows = [
    { name: "John Doe", age: 30, email: "john.doe@example.com" },
    { name: "Jane Smith", age: 25, email: "jane.smith@example.com" },
    { name: "Alice Johnson", age: 35, email: "alice.johnson@example.com" },
  ];
}
