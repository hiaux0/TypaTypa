import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const drawerVariants = cva(
  "fixed inset-0 flex items-center justify-center z-50",
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
      },
      backdrop: {
        default: "bg-black bg-opacity-50",
        none: "",
      },
    },
    defaultVariants: {
      size: "md",
      backdrop: "default",
    },
  },
);

const template = `
  <div class.bind="drawerClass">
    <div class="bg-white rounded-lg shadow-lg p-4">
      <au-slot></au-slot>
    </div>
  </div>
`;

@customElement({
  name: "ui-drawer",
  template,
})
export class UiDrawer {
  @bindable() size: "sm" | "md" | "lg" = "md";
  @bindable() backdrop: "default" | "none" = "default";

  public get drawerClass() {
    return drawerVariants({ size: this.size, backdrop: this.backdrop });
  }
}
