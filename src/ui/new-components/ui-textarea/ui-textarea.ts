import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const textareaVariants = cva(
  "w-full h-full p-2 border rounded-md text-sm font-medium ring-offset-background transition-colors",
  {
    variants: {
      variant: {
        default: "bg-white text-gray-800 border-gray-300",
        destructive: "bg-red-100 text-red-800 border-red-300",
        outline: "bg-white text-gray-800 border-gray-300",
        secondary: "bg-gray-100 text-gray-800 border-gray-300",
      },
      size: {
        default: "h-32",
        sm: "h-24",
        lg: "h-48",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const template = `
  <textarea
    class.bind="textareaClass"
    value.bind="value"
    placeholder.bind="placeholder"
    disabled.bind="disabled"
  ></textarea>
`;

@customElement({
  name: "ui-textarea",
  template,
})
export class UiTextarea {
  @bindable() value: string = "";
  @bindable() placeholder: string = "";
  @bindable() disabled: boolean = false;
  @bindable() variant: "default" | "destructive" | "outline" | "secondary" =
    "default";
  @bindable() size: "default" | "sm" | "lg" = "default";

  public get textareaClass() {
    return textareaVariants({ variant: this.variant, size: this.size });
  }
}
