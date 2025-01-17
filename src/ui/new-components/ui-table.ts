import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const tableVariants = cva(
  "min-w-full divide-y divide-gray-200",
  {
    variants: {
      size: {
        sm: "text-sm",
        md: "text-md",
        lg: "text-lg",
      },
      color: {
        default: "bg-white",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      size: "md",
      color: "default",
    },
  },
);

const template = `
  <div class="overflow-x-auto">
    <div class="min-w-full divide-y divide-gray-200">
      <table class.bind="tableClass">
        <thead>
          <tr>
            <template repeat.for="column of columns">
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                \${column.label}
              </th>
            </template>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <template repeat.for="row of rows">
            <tr>
              <template repeat.for="column of columns">
                <td class="px-6 py-4 whitespace-nowrap">
                  \${row[column.field]}
                </td>
              </template>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
`;

@customElement({
  name: "ui-table",
  template,
})
export class UiTable {
  @bindable() columns: { label: string; field: string }[] = [];
  @bindable() rows: any[] = [];
  @bindable() size: "sm" | "md" | "lg" = "md";
  @bindable() color: "default" | "primary" | "secondary" | "destructive" =
    "default";

  public get tableClass() {
    return tableVariants({ size: this.size, color: this.color });
  }
}
