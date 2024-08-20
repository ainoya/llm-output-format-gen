# JSON Schema Generator for LLM JSON Formatted Output

This tool helps you generate JSON Schema for structured JSON output from Large Language Models (LLMs). It provides a user-friendly interface to define the expected structure of your LLM's output and then generates the corresponding JSON Schema.

- [Structured Outputs \- OpenAI API](https://platform.openai.com/docs/guides/structured-outputs/example-response)
- [Generate JSON output with the Gemini API  \|  Google AI for Developers](https://ai.google.dev/gemini-api/docs/json-mode?hl=en&lang=node)

## Features

- **Intuitive Interface:** Easily define the keys, types, and descriptions of your expected JSON output.
- **Support for Various Types:** Define fields as text, single-select, or multi-select with options.
- **Schema Generation:** Generates valid JSON Schema based on your defined structure.
- **Copy to Clipboard:** Easily copy the generated schema to your clipboard.
- **Shareable URLs:** Generate shareable URLs to easily share your schema configurations.

## Usage

1. **Access the Tool:** You can access the tool by running this code locally or deploying it to a web server.

2. **Define Items:**
    - Click the "Add Item" button to add a new field definition.
    - For each item:
        - **Key:** Specify the key or name of the field.
        - **Type:** Choose the data type: "text", "singleSelect", or "multipleSelect".
        - **Description:** Provide a brief description of the field.
        - **Options (for singleSelect and multipleSelect):** Add the available options for selection.

3. **Generate Options:**
    - **Top Level Key:** Define the top-level key for your JSON output (defaults to "analysisResult").

4. **Generate Schema:**
    - Click the "Generate Schema" button.
    - The generated JSON Schema will be displayed in the text area.
    - You can copy the schema to your clipboard or generate a shareable URL.

## Example

Let's say you expect your LLM to output JSON with the following structure:

```json
{
  "analysisResult": {
    "items": [
      {
        "type": "text",
        "key": "sentiment",
        "description": "Overall sentiment of the text",
        "payload": {
          "value": "positive"
        }
      },
      {
        "type": "singleSelect",
        "key": "topic",
        "description": "Main topic of the text",
        "payload": {
          "value": "technology"
        }
      }
    ]
  }
}
```

You would define the following items in the tool:

- **Item 1:**
  - Key: `sentiment`
  - Type: `text`
  - Description: `Overall sentiment of the text`
- **Item 2:**
  - Key: `topic`
  - Type: `singleSelect`
  - Description: `Main topic of the text`
  - Options: `technology`, `business`, `sports`, etc.

After generating the schema, you can use it as completion api option in OpenAI, Vertex AI, or any other LLM API.

> NOTE: Some LLM APIs may not support the use of oneOf in JSON Schema and therefore may not be able to utilize the json output API option. In this case, please embed the generated schema directly into the prompt.

## License

This project is licensed under the MIT License.
