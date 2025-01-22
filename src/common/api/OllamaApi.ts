type Models =
  | "llama3.1"
  | "llama3.2"
  | "deepseek-r1:1.5b"
  | "deepseek-r1:8b"
  | "deepseek-r1:latest"
  | "phi3.5:latest"
  | "phi4:latest";

// const defaultModel: Models = "deepseek-r1:latest";
// const defaultModel: Models = "phi3.5:latest";
const defaultModel: Models = "llama3.2";

const baseUrl = "http://localhost:11434";

type Options = {
  suffix?: string;
  images?: string[];
  /**
   * "format": {
   *   "type": "object",
   *   "properties": {
   *     "age": {
   *       "type": "integer"
   *     },
   *     "available": {
   *       "type": "boolean"
   *     }
   *   },
   *   "required": [
   *     "age",
   *     "available"
   *   ]
   * }
   */
  format?: string;
  options?: string;
  system?: string;
  template?: string;
  stream?: boolean;
  raw?: boolean;
  keep_alive?: string;
  context?: string;
};

export class OllamaApi {
  constructor(private model: Models = defaultModel) {}

  public async generateCompletion(
    prompt: string,
    model: Models = this.model,
    options?: Options,
  ) {
    const {
      suffix,
      images,
      format,
      system,
      template,
      stream,
      raw,
      keep_alive,
      context,
    } = options ?? {};
    const url = `${baseUrl}/api/generate`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        suffix,
        images,
        format,
        options: options?.options,
        system,
        template,
        stream,
        raw,
        keep_alive,
        context,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (
      stream &&
      response.headers.get("Content-Type") === "application/x-ndjson"
    ) {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let ndjson = "";

      while (true) {
        const { done, value } = (await reader?.read()) ?? {};
        if (done) break;
        ndjson += decoder.decode(value, { stream: true });

        const lines = ndjson.split("\n");
        ndjson = lines.pop()!; // Keep the last partial line

        for (const line of lines) {
          if (line.trim()) {
            const json = JSON.parse(line);
            console.log(json); // Process each JSON object
          }
        }
      }
    } else {
      const result = await response.json();
      return result;
    }
  }
}

export const ollamaApi = new OllamaApi(defaultModel);
