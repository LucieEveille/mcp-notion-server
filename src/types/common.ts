/**
 * Common schema definitions for Notion tools
 * v2.1 — Slimmed down to reduce token overhead and improve CJK accuracy
 */

// Common ID description
export const commonIdDescription =
  "It should be a 32-character string (excluding hyphens) formatted as 8-4-4-4-12 with hyphens (-).";

// Format parameter schema
export const formatParameter = {
  type: "string",
  enum: ["json", "markdown"],
  description:
    "Response format. 'markdown' for reading, 'json' for writing/modifying.",
  default: "markdown",
};

// Rich text object schema — write-only fields, no read-only clutter
export const richTextObjectSchema = {
  type: "object",
  description: "A rich text object for writing content.",
  properties: {
    type: {
      type: "string",
      enum: ["text"],
    },
    text: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The text content.",
        },
        link: {
          type: "object",
          description: "Optional link. Omit entirely if no link.",
          properties: {
            url: { type: "string" },
          },
        },
      },
      required: ["content"],
    },
    annotations: {
      type: "object",
      description: "Optional styling. Omit for plain text.",
      properties: {
        bold: { type: "boolean" },
        italic: { type: "boolean" },
        code: { type: "boolean" },
      },
    },
  },
  required: ["type", "text"],
};

// Shared rich_text array property (reused across block types)
const richTextArrayProp = {
  type: "array",
  description: "Array of rich text objects.",
  items: richTextObjectSchema,
};

// Shared children array property
const childrenProp = {
  type: "array",
  description: "Nested child blocks.",
  items: { type: "object", description: "A nested block object." },
};

// Block object schema — no color enums, no read-only fields
export const blockObjectSchema = {
  type: "object",
  description: "A Notion block object.",
  properties: {
    object: {
      type: "string",
      enum: ["block"],
    },
    type: {
      type: "string",
      description: "Block type: paragraph, heading_1, heading_2, heading_3, bulleted_list_item, numbered_list_item, quote, callout, to_do, divider, toggle.",
    },
    paragraph: {
      type: "object",
      properties: {
        rich_text: richTextArrayProp,
        children: childrenProp,
      },
    },
    heading_1: {
      type: "object",
      properties: { rich_text: richTextArrayProp },
    },
    heading_2: {
      type: "object",
      properties: { rich_text: richTextArrayProp },
    },
    heading_3: {
      type: "object",
      properties: { rich_text: richTextArrayProp },
    },
    bulleted_list_item: {
      type: "object",
      properties: {
        rich_text: richTextArrayProp,
        children: childrenProp,
      },
    },
    numbered_list_item: {
      type: "object",
      properties: {
        rich_text: richTextArrayProp,
        children: childrenProp,
      },
    },
    quote: {
      type: "object",
      properties: { rich_text: richTextArrayProp },
    },
    callout: {
      type: "object",
      properties: {
        rich_text: richTextArrayProp,
        icon: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["emoji"] },
            emoji: { type: "string" },
          },
        },
      },
    },
    to_do: {
      type: "object",
      properties: {
        rich_text: richTextArrayProp,
        checked: { type: "boolean" },
      },
    },
    toggle: {
      type: "object",
      properties: {
        rich_text: richTextArrayProp,
        children: childrenProp,
      },
    },
    divider: {
      type: "object",
      properties: {},
    },
  },
  required: ["object", "type"],
};
