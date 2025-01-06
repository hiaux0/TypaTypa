export class LoadTemplateValueConverter {
  async toView(templatePath: string) {
    /* @vite-ignore */
    const raw = await import(templatePath);
    return raw.template;
  }
}
