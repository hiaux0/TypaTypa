import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Table</h2>
    <ui-table columns.bind="columns" rows.bind="rows"></ui-table>

    <h2>Small Table</h2>
    <ui-table size="sm" columns.bind="columns" rows.bind="rows"></ui-table>

    <h2>Large Table</h2>
    <ui-table size="lg" columns.bind="columns" rows.bind="rows"></ui-table>

    <h2>Primary Table</h2>
    <ui-table color="primary" columns.bind="columns" rows.bind="rows"></ui-table>

    <h2>Secondary Table</h2>
    <ui-table color="secondary" columns.bind="columns" rows.bind="rows"></ui-table>

    <h2>Destructive Table</h2>
    <ui-table color="destructive" columns.bind="columns" rows.bind="rows"></ui-table>
  </div>
`;

@customElement({ name: "ui-table-demo", template })
export class UiTableDemo {
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
