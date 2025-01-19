import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const comboboxVariants = cva(
  "relative inline-block text-left",
  {
    variants: {
      size: {
        sm: "w-32",
        md: "w-48",
        lg: "w-64",
      },
      position: {
        top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
        left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
        right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
      },
    },
    defaultVariants: {
      size: "md",
      position: "bottom",
    },
  },
);

const template = `
  <div class="relative inline-block text-left">
    <div class="combobox-content" class.bind="comboboxClass">
      <au-slot></au-slot>
    </div>
  </div>
`;

@customElement({
  name: "ui-combobox",
  template,
})
export class UiCombobox {
  @bindable() size: "sm" | "md" | "lg" = "md";
  @bindable() position: "top" | "bottom" | "left" | "right" = "bottom";

  public get comboboxClass() {
    return comboboxVariants({ size: this.size, position: this.position });
  }
}
