import { UiDataTable } from "./ui-data-table";

export class UiDataTableDemo {
  public message = "ui-data-table-demo";

  // Example 1: Default Data Table
  public defaultDataTable = `
    <ui-data-table columns.bind="columns" rows.bind="rows"></ui-data-table>
  `;

  // Example 2: Small Data Table
  public smallDataTable = `
    <ui-data-table size="sm" columns.bind="columns" rows.bind="rows"></ui-data-table>
  `;

  // Example 3: Large Data Table
  public largeDataTable = `
    <ui-data-table size="lg" columns.bind="columns" rows.bind="rows"></ui-data-table>
  `;

  // Example 4: Primary Data Table
  public primaryDataTable = `
    <ui-data-table color="primary" columns.bind="columns" rows.bind="rows"></ui-data-table>
  `;

  // Example 5: Secondary Data Table
  public secondaryDataTable = `
    <ui-data-table color="secondary" columns.bind="columns" rows.bind="rows"></ui-data-table>
  `;

  // Example 6: Destructive Data Table
  public destructiveDataTable = `
    <ui-data-table color="destructive" columns.bind="columns" rows.bind="rows"></ui-data-table>
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
