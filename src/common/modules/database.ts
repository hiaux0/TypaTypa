import { TypingDatabaseType, Topic } from "../../types";
import { defaultDatabaseType } from "./constants";

const storageKey = "typing-app-v0.1";

class Database {
  public getItem(): TypingDatabaseType {
    const data =
      localStorage.getItem(storageKey) ?? JSON.stringify(defaultDatabaseType);
    const asJson = JSON.parse(data) as unknown as TypingDatabaseType;
    return asJson;
  }

  public setItem(data: Partial<TypingDatabaseType>): void {
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
