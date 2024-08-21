import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import pkg from "react-copy-to-clipboard";
import toast from "react-hot-toast";
import { useSearchParams } from "@remix-run/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
const { CopyToClipboard } = pkg;

export const meta: MetaFunction = () => {
  return [{ title: "JSON Schema generator for LLM JSON formattted output" }];
};

type SchemaItem = {
  key: string;
  type: "text" | "singleSelect" | "multipleSelect";
  description: string;
  options?: string[];
};

const itemTypes = ["text", "singleSelect", "multipleSelect"] as const;
type ItemType = (typeof itemTypes)[number];

type SchemaItemList = SchemaItem[];

const defaultItemList: SchemaItemList = [];

type ParsedSearchParams = {
  items: SchemaItemList;
  topLevelKey?: string;
};

const parseSearchParamsToItemList = (
  searchParams: URLSearchParams
): ParsedSearchParams => {
  const itemList: SchemaItemList = [];
  const paramItems = searchParams.get("items");

  const topLevelKey = searchParams.get("topLevelKey") || undefined;

  if (paramItems) {
    const items = JSON.parse(paramItems);
    for (const item of items) {
      itemList.push({
        key: item.key,
        type: item.type,
        description: item.description,
        options: item.options,
      });
    }
  } else {
    return {
      items: defaultItemList,
      topLevelKey,
    };
  }

  return {
    items: itemList,
    topLevelKey,
  };
};

const convertItemListToSearchParams = (opt: {
  items: SchemaItemList;
  topLevelKey: string;
}) => {
  return new URLSearchParams({
    items: JSON.stringify(opt.items),
    topLevelKey: opt.topLevelKey,
  });
};

export default function Index() {
  const [items, setItems] = useState(defaultItemList);
  const [topLevelKey, setTopLevelKey] = useState("result");
  const [searchParam] = useSearchParams();

  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    const parsed = parseSearchParamsToItemList(searchParam);
    setItems(parsed.items);
    if (parsed.topLevelKey) {
      setTopLevelKey(parsed.topLevelKey);
    }
  }, [searchParam]);

  const [generatedSchema, setGeneratedSchema] = useState("");

  const handleAddItem = () => {
    setItems([...items, { key: "", type: "text", description: "" }]);
  };

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleDuplicateItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index + 1, 0, { ...items[index] });
    setItems(newItems);
  };

  const handleKeyChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].key = value;
    setItems(newItems);
  };

  const handleTypeChange = (index: number, value: string) => {
    const newItems = [...items];

    if (itemTypes.includes(value as ItemType)) {
      newItems[index].type = value as ItemType;
    }

    setItems(newItems);
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].description = value;
    setItems(newItems);
  };

  const handleOptionChange = (
    itemIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const newItems = [...items];
    if (newItems[itemIndex].options) {
      newItems[itemIndex].options[optionIndex] = value;
    }
    setItems(newItems);
  };

  const handleAddOption = (index: number) => {
    const newItems = [...items];
    if (!newItems[index].options) {
      newItems[index].options = [""];
    } else {
      newItems[index].options.push("");
    }
    setItems(newItems);
  };

  const handleDeleteOption = (itemIndex: number, optionIndex: number) => {
    const newItems = [...items];
    newItems[itemIndex]?.options?.splice(optionIndex, 1);
    setItems(newItems);
  };

  const generateSchema = () => {
    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        [topLevelKey]: {
          type: "object",
          additionalProperties: false,
          properties: {
            items: {
              type: "array",
              additionalProperties: false,
              items: {
                oneOf: items.map((item) => ({
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    type: {
                      const: item.type,
                    },
                    key: {
                      const: item.key,
                    },
                    description: {
                      const: item.description,
                    },
                    payload: {
                      type: "object",
                      properties: {
                        value: {
                          type:
                            item.type === "multipleSelect" ? "array" : "string",
                          items:
                            item.type === "singleSelect" ||
                            item.type === "multipleSelect"
                              ? {
                                  type: "string",
                                  enum: item.options,
                                }
                              : undefined,
                        },
                      },
                      required: ["value"],
                    },
                  },
                  required: ["type", "key", "description", "payload"],
                })),
              },
            },
          },
          required: ["items"],
        },
      },
      required: [topLevelKey],
    };

    setGeneratedSchema(JSON.stringify(schema, null, 2));
    console.debug(`items: ${JSON.stringify(items)}`);
    const shareUrlParam: URLSearchParams = convertItemListToSearchParams({
      items,
      topLevelKey,
    });

    setShareUrl(
      `${window.location.origin}${
        window.location.pathname
      }?${shareUrlParam.toString()}`
    );
    console.debug(`shareUrl: ${shareUrl}`);
    toast.success("Generated schema!");
  };

  return (
    <div className="container mx-auto p-4">
      <p>
        <a href="https://github.com/ainoya/llm-output-format-gen">
          github: ainoya/llm-output-format-gen
        </a>
      </p>
      <h2 className="text-2xl font-bold mb-4">Item Definitions</h2>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="border p-4 rounded-md">
            <h3 className="text-xl font-bold mb-2">Item {index + 1}</h3>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label
                  htmlFor={`key-${index}`}
                  className="block text-gray-700 font-bold mb-2"
                >
                  Key:
                </label>
                <input
                  type="text"
                  id={`key-${index}`}
                  value={item.key}
                  onChange={(e) => handleKeyChange(index, e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label
                  htmlFor={`type-${index}`}
                  className="block text-gray-700 font-bold mb-2"
                >
                  Type:
                </label>
                <Select
                  value={item.type}
                  onValueChange={(value) => handleTypeChange(index, value)}
                >
                  <SelectTrigger
                    className="w-full shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id={`type-${index}`}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="singleSelect">Single Select</SelectItem>
                    <SelectItem value="multipleSelect">Multi Select</SelectItem>
                  </SelectContent>
                </Select>{" "}
              </div>
            </div>
            {(item.type === "singleSelect" ||
              item.type === "multipleSelect") && (
              <div className="mb-2">
                <p className="block text-gray-700 font-bold mb-2">Options:</p>
                <div className="space-y-2">
                  {item.options &&
                    item.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center">
                        <Input
                          type="text"
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(
                              index,
                              optionIndex,
                              e.target.value
                            )
                          }
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                        />
                        <Button
                          onClick={() => handleDeleteOption(index, optionIndex)}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  <Button
                    onClick={() => handleAddOption(index)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Add Option
                  </Button>
                </div>
              </div>
            )}
            <div className="mb-2">
              <label
                htmlFor={`description-${index}`}
                className="block text-gray-700 font-bold mb-2"
              >
                Description:
              </label>
              <Textarea
                id={`description-${index}`}
                value={item.description}
                onChange={(e) => handleDescriptionChange(index, e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleDeleteItem(index)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Delete
              </Button>
              <Button
                onClick={() => handleDuplicateItem(index)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Duplicate
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button
        onClick={handleAddItem}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
      >
        Add Item
      </Button>

      {/* generate options */}
      <h5 className="text-lg font-bold mt-8 mb-4">Generate Options</h5>
      <div>
        {/* textfield set topLevelKey */}
        <div className="mb-2">
          <label
            htmlFor="topLevelKey"
            className="block text-gray-700 font-bold mb-2"
          >
            Top Level Key:
          </label>
          <Input
            type="text"
            id="topLevelKey"
            value={topLevelKey}
            onChange={(e) => setTopLevelKey(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Generated JSON Schema</h2>
      <div>
        <div className="flex space-x-4">
          <div>
            <Button
              onClick={generateSchema}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Generate Schema
            </Button>
          </div>
          <div>
            {generatedSchema && (
              <CopyToClipboard text={generatedSchema}>
                <Button
                  className="bg-green-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-2"
                  onClick={() => toast.success("Copied to clipboard!")}
                >
                  Copy to Clipboard
                </Button>
              </CopyToClipboard>
            )}
          </div>
          <div>
            {generatedSchema && (
              <CopyToClipboard text={shareUrl}>
                <Button
                  className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-2"
                  onClick={() => toast.success("Copied to clipboard!")}
                >
                  Share URL
                </Button>
              </CopyToClipboard>
            )}
          </div>
        </div>
      </div>

      <div></div>
      <pre
        className="bg-gray-100 p-4 rounded-md mt-4 text-sm"
        style={{
          height: "500px",
          overflow: "auto",
        }}
      >
        {generatedSchema}
      </pre>
    </div>
  );
}
