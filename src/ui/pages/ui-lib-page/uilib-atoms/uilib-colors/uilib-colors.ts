export class UilibColors {
  public colors = [
    { name: 'background', value: 'hsl(var(--background))' },
    { name: 'foreground', value: 'hsl(var(--foreground))' },
    { name: 'card', value: 'hsl(var(--card))' },
    { name: 'card-foreground', value: 'hsl(var(--card-foreground))' },
    { name: 'popover', value: 'hsl(var(--popover))' },
    { name: 'popover-foreground', value: 'hsl(var(--popover-foreground))' },
    { name: 'primary', value: 'hsl(var(--primary))' },
    { name: 'primary-foreground', value: 'hsl(var(--primary-foreground))' },
    { name: 'secondary', value: 'hsl(var(--secondary))' },
    { name: 'secondary-foreground', value: 'hsl(var(--secondary-foreground))' },
    { name: 'muted', value: 'hsl(var(--muted))' },
    { name: 'muted-foreground', value: 'hsl(var(--muted-foreground))' },
    { name: 'accent', value: 'hsl(var(--accent))' },
    { name: 'accent-foreground', value: 'hsl(var(--accent-foreground))' },
    { name: 'destructive', value: 'hsl(var(--destructive))' },
    { name: 'destructive-foreground', value: 'hsl(var(--destructive-foreground))' },
    { name: 'border', value: 'hsl(var(--border))' },
    { name: 'input', value: 'hsl(var(--input))' },
    { name: 'ring', value: 'hsl(var(--ring))' },
    { name: 'chart-1', value: 'hsl(var(--chart-1))' },
    { name: 'chart-2', value: 'hsl(var(--chart-2))' },
    { name: 'chart-3', value: 'hsl(var(--chart-3))' },
    { name: 'chart-4', value: 'hsl(var(--chart-4))' },
    { name: 'chart-5', value: 'hsl(var(--chart-5))' },
    { name: 'radius', value: '0.5rem' },
    { name: 'sidebar-background', value: 'hsl(var(--sidebar-background))' },
    { name: 'sidebar-foreground', value: 'hsl(var(--sidebar-foreground))' },
    { name: 'sidebar-primary', value: 'hsl(var(--sidebar-primary))' },
    { name: 'sidebar-primary-foreground', value: 'hsl(var(--sidebar-primary-foreground))' },
    { name: 'sidebar-accent', value: 'hsl(var(--sidebar-accent))' },
    { name: 'sidebar-accent-foreground', value: 'hsl(var(--sidebar-accent-foreground))' },
    { name: 'sidebar-border', value: 'hsl(var(--sidebar-border))' },
    { name: 'sidebar-ring', value: 'hsl(var(--sidebar-ring))' },
  ];

  public generateColorElements() {
    return this.colors.map(color => {
      const div = document.createElement('div');
      div.className = `color-box color-${color.name}`;
      div.style.backgroundColor = color.value;
      div.textContent = color.name;
      return div;
    });
  }
}
