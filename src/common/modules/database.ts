import { TypingDatabaseType, Topic } from "../../types";
import { defaultDatabaseType } from "./constants";

export class Database<T> {
  public storageKey = "";

  constructor(key: string) {
    this.storageKey = key;
  }

  public getItem(): T {
    const data =
      localStorage.getItem(this.storageKey) ??
      JSON.stringify(defaultDatabaseType);
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

class TypingDatabase extends Database<TypingDatabaseType> {
  constructor(storageKey: string) {
    super(storageKey);
  }
  public getSelectedTopic(): Topic | undefined {
    const { topics, selectedTopicId } = super.getItem();
    const targetTopic = topics.find((topic) => topic.id === selectedTopicId);
    return targetTopic;
  }
}

const typingStorageKey = "typing-app-v0.1";
export const typingDatabase = new TypingDatabase(typingStorageKey);
