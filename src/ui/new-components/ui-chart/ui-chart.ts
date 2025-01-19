import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const chartVariants = cva(
  "w-full h-full",
  {
    variants: {
      type: {
        bar: "bar-chart",
        line: "line-chart",
        pie: "pie-chart",
      },
      color: {
        default: "text-gray-400",
        primary: "text-primary",
        secondary: "text-secondary",
        destructive: "text-destructive",
      },
    },
    defaultVariants: {
      type: "bar",
      color: "default",
    },
  },
);

const template = `
  <div class.bind="chartClass">
    <canvas ref="canvas"></canvas>
  </div>
`;

@customElement({
  name: "ui-chart",
  template,
})
export class UiChart {
  @bindable() type: "bar" | "line" | "pie" = "bar";
  @bindable() color: "default" | "primary" | "secondary" | "destructive" =
    "default";
  @bindable() data: any;
  @bindable() options: any;

  public get chartClass() {
    return chartVariants({ type: this.type, color: this.color });
  }

  attached() {
    this.renderChart();
  }

  dataChanged() {
    this.renderChart();
  }

  optionsChanged() {
    this.renderChart();
  }

  private renderChart() {
    if (this.canvas) {
      const ctx = this.canvas.getContext("2d");
      new Chart(ctx, {
        type: this.type,
        data: this.data,
        options: this.options,
      });
    }
  }
}
