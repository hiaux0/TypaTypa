/**
Generate a completion

POST /api/generate

Generate a response for a given prompt with a provided model. This is a streaming endpoint, so there will be a series of responses. The final response object will include statistics and additional data from the request.
Parameters

    model: (required) the model name
    prompt: the prompt to generate a response for
    suffix: the text after the model response
    images: (optional) a list of base64-encoded images (for multimodal models such as llava)

Advanced parameters (optional):

    format: the format to return a response in. Format can be json or a JSON schema
    options: additional model parameters listed in the documentation for the Modelfile such as temperature
    system: system message to (overrides what is defined in the Modelfile)
    template: the prompt template to use (overrides what is defined in the Modelfile)
    stream: if false the response will be returned as a single response object, rather than a stream of objects
    raw: if true no formatting will be applied to the prompt. You may choose to use the raw parameter if you are specifying a full templated prompt in your request to the API
    keep_alive: controls how long the model will stay loaded into memory following the request (default: 5m)
    context (deprecated): the context parameter returned from a previous request to /generate, this can be used to keep a short conversational memory

Structured outputs

Structured outputs are supported by providing a JSON schema in the format parameter. The model will generate a response that matches the schema. See the structured outputs example below.
JSON mode

Enable JSON mode by setting the format parameter to json. This will structure the response as a valid JSON object. See the JSON mode example below.

Important

It's important to instruct the model to use JSON in the prompt. Otherwise, the model may generate large amounts whitespace.
Examples
Generate request (Streaming)
Request

curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Why is the sky blue?"
}'

Response

A stream of JSON objects is returned:

{
  "model": "llama3.2",
  "created_at": "2023-08-04T08:52:19.385406455-07:00",
  "response": "The",
  "done": false
}
 */

type Models =
  | "llama3.2"
  | "llama3.2-llava"
  | "llama3.2-llava-2"
  | "llama3.2-llava-3";

const baseUrl = "http://localhost:11434";

export class OllamaApi {
  public async generateCompletion(
    prompt: string,
    model: Models = "llama3.2",
    options?: {
      suffix?: string;
      images?: string[];
      format?: string;
      options?: string;
      system?: string;
      template?: string;
      stream?: boolean;
      raw?: boolean;
      keep_alive?: string;
      context?: string;
    }
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
      context
    } = options ?? {};
    const url = `${baseUrl}/api/generate`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
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
        context
      })
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
      console.log(result); // Process the result
    }
  }
}

export const ollamaApi = new OllamaApi();
