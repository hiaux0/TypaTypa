import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const sliderVariants = cva(
  "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer",
  {
    variants: {
      size: {
        sm: "h-1",
        md: "h-2",
        lg: "h-3",
      },
      color: {
        default: "bg-gray-200",
        primary: "bg-primary-500",
        secondary: "bg-secondary-500",
        destructive: "bg-destructive-500",
      },
    },
    defaultVariants: {
      size: "md",
      color: "default",
    },
  },
);

const template = `
  <input
    type="range"
    class.bind="sliderClass"
    min.bind="min"
    max.bind="max"
    step.bind="step"
    value.bind="value"
    disabled.bind="disabled"
  />
`;

@customElement({
  name: "ui-slider",
  template,
})
export class UiSlider {
  @bindable() min: number = 0;
  @bindable() max: number = 100;
  @bindable() step: number = 1;
  @bindable() value: number = 0;
  @bindable() disabled: boolean = false;
  @bindable() size: "sm" | "md" | "lg" = "md";
  @bindable() color: "default" | "primary" | "secondary" | "destructive" =
    "default";

  public get sliderClass() {
    return sliderVariants({ size: this.size, color: this.color });
  }
}
