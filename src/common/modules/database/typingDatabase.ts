import { TypingDatabaseType, Topic } from "../../../types";
import { Database } from "./database";
import { defaultDatabaseType } from "../constants";

class TypingDatabase extends Database<TypingDatabaseType> {
  constructor(storageKey: string, defaultData: TypingDatabaseType) {
    super(storageKey, defaultData as any);
  }
  public getSelectedTopic(): Topic | undefined {
    const { topics, selectedTopicId } = super.getItem();
    const targetTopic = topics.find((topic) => topic.id === selectedTopicId);
    return targetTopic;
  }
}

const typingStorageKey = "typing-app-v0.1";
export const typingDatabase = new TypingDatabase(
  typingStorageKey,
  defaultDatabaseType,
);
