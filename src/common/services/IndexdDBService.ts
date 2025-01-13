export class IndexedDBService {
  private dbName: string;
  private dbVersion: number;
  private storeName: string;

  constructor(
    dbName: string = "audio",
    dbVersion: number = 1,
    storeName: string = "files",
  ) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
    this.storeName = storeName;
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  public async saveFile(file: Blob): Promise<number> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      /*prettier-ignore*/ console.log("[IndexdDBService.ts,46] file: ", file);
      const request = store.add({ file });
      /*prettier-ignore*/ console.log("[IndexdDBService.ts,46] request: ", request);

      request.onsuccess = () => {
        /*prettier-ignore*/ console.log("[IndexdDBService.ts,51] request: ", request);
        const fileId = request.result as number;
        // await this.databaseService.save(file);
        console.log(`File saved with ID: ${fileId}`);
        // Store the fileId for later use
        localStorage.setItem("audioFileId", fileId.toString());
        resolve(request.result as number);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  public async loadFile() {
    const fileId = localStorage.getItem("audioFileId");
    if (fileId) {
      const file = await this.getFile(Number(fileId));
      if (file) {
        const objectURL = window.URL.createObjectURL(file);
        /*prettier-ignore*/ console.log("[IndexdDBService.ts,65] objectURL: ", objectURL);
        return {objectURL, file};
      }
    }
  }

  public async getFile(id: number): Promise<Blob | undefined> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        const file = request.result?.file
        /*prettier-ignore*/ console.log("[IndexdDBService.ts,86] file: ", file);
        resolve(file);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

export default IndexedDBService;
