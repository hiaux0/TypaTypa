
export class Database<T> {
  public storageKey = "";
  public defaultData = "";

  constructor(key: string, defaultData: Record<string, unknown> = {}) {
    this.storageKey = key;
    this.defaultData = JSON.stringify(defaultData);
  }

  public getItem(): T {
    const data =
      localStorage.getItem(this.storageKey) ??
      JSON.stringify(this.defaultData);
    const asJson = JSON.parse(data) as unknown as T;
    return asJson;
  }

  public setItem(data: Partial<T>): void {
    const existingData = this.getItem();
    const finalData = {
      ...existingData,
      ...data,
    };
    localStorage.setItem(this.storageKey, JSON.stringify(finalData));
  }
}
