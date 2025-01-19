import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const commandVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
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
  <button
    type.bind="type"
    disabled.bind="disabled"
    click.trigger="handleClick()"
    class.bind="commandClass"
    aria-pressed.bind="pressed"
    aria-label.bind="label"
    tabindex="0"
    role="button">
      <template if.bind="label">\${label}</template>
      <au-slot else></au-slot>
  </button>
`;

@customElement({
  name: "ui-command",
  template,
})
export class UiCommand {
  @bindable() label: string = "Command";
  @bindable() type: string = "button";
  @bindable() disabled: boolean = false;
  @bindable() click: () => void;
  @bindable() variant:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  @bindable() size: "default" | "sm" | "lg" | "icon";
  @bindable() pressed: boolean = false;

  public get commandClass() {
    const styles = commandVariants({ variant: this.variant });
    return styles;
  }

  public handleClick() {
    if (this.click && !this.disabled) {
      this.click();
    }
  }

  attached() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  detached() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      this.handleClick();
    }
  };
}
