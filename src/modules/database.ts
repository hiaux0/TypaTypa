import { DatabaseType, defaultDatabaseType, Topic } from "../types";

const storageKey = "typing-app-v0.1";

class Database {
  public getItem(): DatabaseType {
    const data =
      localStorage.getItem(storageKey) ?? JSON.stringify(defaultDatabaseType);
    const asJson = JSON.parse(data) as unknown as DatabaseType;
    return asJson;
  }

  public setItem(data: Partial<DatabaseType>): void {
    const existingData = this.getItem();
    const finalData = {
      ...existingData,
      ...data,
    };
    localStorage.setItem(storageKey, JSON.stringify(finalData));
  }

  public getSelectedTopic(): Topic | undefined {
    const { topics, selectedTopicId } = this.getItem();
    const targetTopic = topics.find((topic) => topic.id === selectedTopicId);
    return targetTopic;
  }
}

export const database = new Database();
