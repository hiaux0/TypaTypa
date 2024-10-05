import { TypingDatabaseType, Topic } from "../../types";
import { defaultDatabaseType } from "./constants";

const storageKey = "typing-app-v0.1";

class Database<T> {
  public getItem(): T {
    const data =
      localStorage.getItem(storageKey) ?? JSON.stringify(defaultDatabaseType);
    const asJson = JSON.parse(data) as unknown as T;
    return asJson;
  }

  public setItem(data: Partial<T>): void {
    const existingData = this.getItem();
    const finalData = {
      ...existingData,
      ...data,
    };
    localStorage.setItem(storageKey, JSON.stringify(finalData));
  }
}

class TypingDatabase extends Database<TypingDatabaseType> {
  constructor() {
    super();
  }
  public getSelectedTopic(): Topic | undefined {
    const { topics, selectedTopicId } = super.getItem();
    const targetTopic = topics.find((topic) => topic.id === selectedTopicId);
    return targetTopic;
  }
}

export const typingDatabase = new TypingDatabase();
