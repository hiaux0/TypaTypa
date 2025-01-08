export class LoadTemplateValueConverter {
  async toView(templatePath: string) {
    const raw = await import(/* @vite-ignore */ templatePath);
    return raw.template;
  }
}
