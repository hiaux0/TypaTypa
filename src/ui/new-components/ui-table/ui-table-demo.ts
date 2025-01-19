import { UiTable } from "./ui-table";

export class UiTableDemo {
  public message = "ui-table-demo";

  // Example 1: Default Table
  public defaultTable = `
    <ui-table columns.bind="columns" rows.bind="rows"></ui-table>
  `;

  // Example 2: Small Table
  public smallTable = `
    <ui-table size="sm" columns.bind="columns" rows.bind="rows"></ui-table>
  `;

  // Example 3: Large Table
  public largeTable = `
    <ui-table size="lg" columns.bind="columns" rows.bind="rows"></ui-table>
  `;

  // Example 4: Primary Table
  public primaryTable = `
    <ui-table color="primary" columns.bind="columns" rows.bind="rows"></ui-table>
  `;

  // Example 5: Secondary Table
  public secondaryTable = `
    <ui-table color="secondary" columns.bind="columns" rows.bind="rows"></ui-table>
  `;

  // Example 6: Destructive Table
  public destructiveTable = `
    <ui-table color="destructive" columns.bind="columns" rows.bind="rows"></ui-table>
  `;

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
