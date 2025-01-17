import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const radioGroupVariants = cva(
  "flex flex-col space-y-2",
  {
    variants: {
      direction: {
        vertical: "flex-col space-y-2",
        horizontal: "flex-row space-x-2",
      },
    },
    defaultVariants: {
      direction: "vertical",
    },
  },
);

const template = `
  <div class.bind="radioGroupClass">
    <au-slot></au-slot>
  </div>
`;

@customElement({
  name: "ui-radio-group",
  template,
})
export class UiRadioGroup {
  @bindable() direction: "vertical" | "horizontal" = "vertical";

  public get radioGroupClass() {
    return radioGroupVariants({ direction: this.direction });
  }
}
