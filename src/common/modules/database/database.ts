const AUTO_SAVE_INTERVAL = 1000;

export class Database<T> {
  public storageKey = "";
  public defaultData: any;

  constructor(key: string, defaultData: Record<string, unknown> = {}) {
    this.storageKey = key;
    this.defaultData = defaultData;
  }

  public getItem(): T {
    const data =
      // localStorage.getItem(this.storageKey) ?? JSON.stringify(this.defaultData);
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

  public autosave(callback: () => void): void {
    window.setInterval(() => {
      callback();
    }, AUTO_SAVE_INTERVAL);
  }
}
