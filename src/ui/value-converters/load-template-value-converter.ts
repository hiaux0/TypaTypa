export class LoadTemplateValueConverter {
  async toView(templatePath: string) {
    const raw = await import(templatePath);
    return raw.template;
  }
}
