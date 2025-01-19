import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const progressVariants = cva(
  "relative w-full h-2 bg-gray-200 rounded-full overflow-hidden",
  {
    variants: {
      color: {
        default: "bg-primary",
        secondary: "bg-secondary",
        destructive: "bg-destructive",
      },
    },
    defaultVariants: {
      color: "default",
    },
  },
);

const template = `
  <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
    <div class.bind="progressClass" style="width: \${value}%"></div>
  </div>
`;

@customElement({
  name: "ui-progress",
  template,
})
export class UiProgress {
  @bindable() value: number = 0;
  @bindable() color: "default" | "secondary" | "destructive" = "default";

  public get progressClass() {
    return progressVariants({ color: this.color });
  }
}
