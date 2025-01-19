import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const skeletonVariants = cva(
  "animate-pulse bg-gray-200 rounded",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
      },
      shape: {
        square: "rounded-none",
        rounded: "rounded-md",
        circle: "rounded-full",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "rounded",
    },
  },
);

const template = `
  <div class.bind="skeletonClass">
    <au-slot></au-slot>
  </div>
`;

@customElement({
  name: "ui-skeleton",
  template,
})
export class UiSkeleton {
  @bindable() size: "sm" | "md" | "lg" = "md";
  @bindable() shape: "square" | "rounded" | "circle" = "rounded";

  public get skeletonClass() {
    return skeletonVariants({ size: this.size, shape: this.shape });
  }
}
