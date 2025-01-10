# Generate a completion
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

```
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Why is the sky blue?"
}'
```

Response

A stream of JSON objects is returned:

```
{
  "model": "llama3.2",
  "created_at": "2023-08-04T08:52:19.385406455-07:00",
  "response": "The",
  "done": false
}
```

### Request (Structured outputs)

```
curl -X POST http://localhost:11434/api/generate -H "Content-Type: application/json" -d '{
  "model": "llama3.1:8b",
  "prompt": "Ollama is 22 years old and is busy saving the world. Respond using JSON",
  "stream": false,
  "format": {
    "type": "object",
    "properties": {
      "age": {
        "type": "integer"
      },
      "available": {
        "type": "boolean"
      }
    },
    "required": [
      "age",
      "available"
    ]
  }
}'
```
