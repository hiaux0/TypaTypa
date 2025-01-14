export class LoadTemplateValueConverter {
  async toView(templatePath: string | undefined) {
    if (!templatePath) return;
    const raw = await import(/* @vite-ignore */ templatePath);
    return raw.template;
  }
}
