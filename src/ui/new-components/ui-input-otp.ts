import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const inputOtpVariants = cva(
  `
  w-full h-full
  inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
  disabled:pointer-events-none disabled:opacity-50
  [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`,
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const template = `
  <div class="flex space-x-2">
    <input
      type="text"
      maxlength="1"
      class.bind="inputOtpClass"
      value.bind="value1"
      disabled.bind="disabled"
    />
    <input
      type="text"
      maxlength="1"
      class.bind="inputOtpClass"
      value.bind="value2"
      disabled.bind="disabled"
    />
    <input
      type="text"
      maxlength="1"
      class.bind="inputOtpClass"
      value.bind="value3"
      disabled.bind="disabled"
    />
    <input
      type="text"
      maxlength="1"
      class.bind="inputOtpClass"
      value.bind="value4"
      disabled.bind="disabled"
    />
    <input
      type="text"
      maxlength="1"
      class.bind="inputOtpClass"
      value.bind="value5"
      disabled.bind="disabled"
    />
    <input
      type="text"
      maxlength="1"
      class.bind="inputOtpClass"
      value.bind="value6"
      disabled.bind="disabled"
    />
  </div>
`;

@customElement({
  name: "ui-input-otp",
  template,
})
export class UiInputOtp {
  @bindable() value1: string = "";
  @bindable() value2: string = "";
  @bindable() value3: string = "";
  @bindable() value4: string = "";
  @bindable() value5: string = "";
  @bindable() value6: string = "";
  @bindable() disabled: boolean = false;
  @bindable() variant:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  @bindable() size: "default" | "sm" | "lg" | "icon";

  public get inputOtpClass() {
    const styles = inputOtpVariants({ variant: this.variant });
    return styles;
  }
}
