import { createRxDatabase, addRxPlugin, RxCollection, RxDatabase } from "rxdb";
import { RxDBAttachmentsPlugin } from "rxdb/plugins/attachments";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { wrappedValidateZSchemaStorage } from "rxdb/plugins/validate-z-schema";
import { generateId } from "../modules/random";

const audioFileSchema = {
  title: "audio-files-db",
  version: 0,
  description: "describes an audio file",
  type: "object",
  primaryKey: "id",
  properties: {
    id: {
      type: "string",
      primary: true,
      maxLength: 100,
    },
    name: {
      type: "string",
    },
    type: {
      type: "string",
    },
  },
  attachments: {
    encrypted: false, // if true, the attachment-data will be encrypted with the db-password
  },
};

// Add the necessary plugins
addRxPlugin(RxDBDevModePlugin);
addRxPlugin(RxDBAttachmentsPlugin);

const dbName = "audio-files-db";
const storage = wrappedValidateZSchemaStorage({
  storage: getRxStorageDexie(),
});

export class DatabaseService {
  dbPromise: ReturnType<typeof createRxDatabase>;
  collections: { audio: RxCollection<any, {}, {}, {}, unknown> };

  public async init(): Promise<void> {
    try {
      this.dbPromise = createRxDatabase({
        name: dbName,
        storage,
        multiInstance: true,
        eventReduce: true,
        ignoreDuplicate: true,
      });

      this.hasCollections().then((has) => {
        if (has) return;

        this.dbPromise.then(async (db) => {
          /*prettier-ignore*/ console.log("[DatabaseService.ts,59] db: ", db);
          this.collections = await db.addCollections({
            audio: { schema: audioFileSchema },
          });
          /*prettier-ignore*/ console.log("[DatabaseService.ts,60] this.collections: ", this.collections);
        });
      });
    } catch (error) {
      console.error(error);
    }
  }

  public async getCollection(name: "audio") {
    const db = await this.getDatabase();
    const collections = db.collections;
    /*prettier-ignore*/ console.log("[DatabaseService.ts,73] collections: ", collections);
    return collections[name];
  }

  public async save(file: File) {
    const db = await this.getDatabase();
    /*prettier-ignore*/ console.log("[DatabaseService.ts,81] db: ", db);
    /*prettier-ignore*/ console.log("[DatabaseService.ts,81] this.collections: ", this.collections);
    /*prettier-ignore*/ console.log("[DatabaseService.ts,83] db.collectoins: ", db.collectoins);
    const audioFiles = db.collections.audio;
    /*prettier-ignore*/ console.log("[DatabaseService.ts,81] audioFiles: ", audioFiles);
    const id = generateId();
    const doc = await audioFiles.insert({
      id,
      name: file.name,
      type: file.type,
    });
    await doc.putAttachment({
      id: "audio",
      data: file,
      type: file.type,
    });
    return doc;
  }

  private async getDatabase(): Promise<RxDatabase> {
    try {
      const db = await createRxDatabase({
        name: dbName,
        storage,
        multiInstance: true,
        eventReduce: true,
        ignoreDuplicate: true,
      });
      return db;
    } catch (error) {
      console.error("Failed to get database:", error);
      throw error;
    }
  }

  private async hasCollections(): Promise<boolean> {
    const db = await this.dbPromise;
    const collections = db.collections;
    if (collections.audio) {
      const count = await collections.audio.find().exec();
      return count.length > 0;
    }
    return false;
  }
}
