import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const aspectRatioVariants = cva(
  "relative",
  {
    variants: {
      ratio: {
        "1/1": "aspect-w-1 aspect-h-1",
        "16/9": "aspect-w-16 aspect-h-9",
        "4/3": "aspect-w-4 aspect-h-3",
        "21/9": "aspect-w-21 aspect-h-9",
      },
    },
    defaultVariants: {
      ratio: "16/9",
    },
  },
);

const template = `
  <div class.bind="aspectRatioClass">
    <au-slot></au-slot>
  </div>
`;

@customElement({
  name: "ui-aspect-ratio",
  template,
})
export class UiAspectRatio {
  @bindable() ratio: "1/1" | "16/9" | "4/3" | "21/9" = "16/9";

  public get aspectRatioClass() {
    return aspectRatioVariants({ ratio: this.ratio });
  }
}
