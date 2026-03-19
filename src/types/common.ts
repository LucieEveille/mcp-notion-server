/**
 * Common schema definitions for Notion tools
 */

// Common ID description
export const commonIdDescription =
  "It should be a 32-character string (excluding hyphens) formatted as 8-4-4-4-12 with hyphens (-).";

// Format parameter schema
export const formatParameter = {
  type: "string",
  enum: ["json", "markdown"],
  description:
    "Specify the response format. 'json' returns the original data structure, 'markdown' returns a more readable format. Use 'markdown' when the user only needs to read the page and isn't planning to write or modify it. Use 'json' when the user needs to read the page with the intention of writing to or modifying it.",
  default: "markdown",
};

// Rich text object schema (lite: text only, no mention/equation)
export const richTextObjectSchema = {
  type: "object",
  description: "A rich text object.",
  properties: {
    type: {
      type: "string",
      description: "The type of this rich text object.",
      enum: ["text"],
    },
    text: {
      type: "object",
      description:
        "Object containing text content and optional link info.",
      properties: {
        content: {
          type: "string",
          description: "The actual text content.",
        },
        link: {
          type: "object",
          description: "Optional link object with a 'url' field. Do NOT provide a NULL value, just ignore this field no link.",
          properties: {
            url: {
              type: "string",
              description: "The URL the text links to.",
            },
          },
        },
      },
    },
    annotations: {
      type: "object",
      description: "Styling information for the text. By default, give nothing for default text.",
      properties: {
        bold: { type: "boolean" },
        italic: { type: "boolean" },
        strikethrough: { type: "boolean" },
        underline: { type: "boolean" },
        code: { type: "boolean" },
        color: {
          type: "string",
          description: "Color for the text.",
          enum: [
            "default",
            "blue",
            "blue_background",
            "brown",
            "brown_background",
            "gray",
            "gray_background",
            "green",
            "green_background",
            "orange",
            "orange_background",
            "pink",
            "pink_background",
            "purple",
            "purple_background",
            "red",
            "red_background",
            "yellow",
            "yellow_background",
          ],
        },
      },
    },
    href: {
      type: "string",
      description: "The URL of any link in this text, if any. Do NOT provide a NULL value, just ignore this field if there is no link.",
    },
    plain_text: {
      type: "string",
      description: "The plain text without annotations.",
    },
  },
  required: ["type"],
};

// Block object schema
export const blockObjectSchema = {
  type: "object",
  description: "A Notion block object.",
  properties: {
    object: {
      type: "string",
      description: "Should be 'block'.",
      enum: ["block"],
    },
    type: {
      type: "string",
      description:
        "Type of the block. Supported values: 'paragraph', 'heading_1', 'heading_2', 'heading_3', 'bulleted_list_item', 'numbered_list_item', 'divider'.",
    },
    paragraph: {
      type: "object",
      description: "Paragraph block object.",
      properties: {
        rich_text: {
          type: "array",
          description:
            "Array of rich text objects representing the comment content.",
          items: richTextObjectSchema,
        },
        color: {
          type: "string",
          description: "The color of the block.",
          enum: [
            "default",
            "blue",
            "blue_background",
            "brown",
            "brown_background",
            "gray",
            "gray_background",
            "green",
            "green_background",
            "orange",
            "orange_background",
            "pink",
            "pink_background",
            "purple",
            "purple_background",
            "red",
            "red_background",
            "yellow",
            "yellow_background",
          ],
        },
        children: {
          type: "array",
          description: "Nested child blocks.",
          items: {
            type: "object",
            description: "A nested block object.",
          },
        },
      },
    },
    heading_1: {
      type: "object",
      description: "Heading 1 block object.",
      properties: {
        rich_text: {
          type: "array",
          description: "Array of rich text objects representing the heading content.",
          items: richTextObjectSchema,
        },
        color: {
          type: "string",
          description: "The color of the block.",
          enum: [
            "default",
            "blue",
            "blue_background",
            "brown",
            "brown_background",
            "gray",
            "gray_background",
            "green",
            "green_background",
            "orange",
            "orange_background",
            "pink",
            "pink_background",
            "purple",
            "purple_background",
            "red",
            "red_background",
            "yellow",
            "yellow_background",
          ],
        },
        is_toggleable: {
          type: "boolean",
          description: "Whether the heading can be toggled.",
        },
      },
    },
    heading_2: {
      type: "object",
      description: "Heading 2 block object.",
      properties: {
        rich_text: {
          type: "array",
          description: "Array of rich text objects representing the heading content.",
          items: richTextObjectSchema,
        },
        color: {
          type: "string",
          description: "The color of the block.",
          enum: [
            "default",
            "blue",
            "blue_background",
            "brown",
            "brown_background",
            "gray",
            "gray_background",
            "green",
            "green_background",
            "orange",
            "orange_background",
            "pink",
            "pink_background",
            "purple",
            "purple_background",
            "red",
            "red_background",
            "yellow",
            "yellow_background",
          ],
        },
        is_toggleable: {
          type: "boolean",
          description: "Whether the heading can be toggled.",
        },
      },
    },
    heading_3: {
      type: "object",
      description: "Heading 3 block object.",
      properties: {
        rich_text: {
          type: "array",
          description: "Array of rich text objects representing the heading content.",
          items: richTextObjectSchema,
        },
        color: {
          type: "string",
          description: "The color of the block.",
          enum: [
            "default",
            "blue",
            "blue_background",
            "brown",
            "brown_background",
            "gray",
            "gray_background",
            "green",
            "green_background",
            "orange",
            "orange_background",
            "pink",
            "pink_background",
            "purple",
            "purple_background",
            "red",
            "red_background",
            "yellow",
            "yellow_background",
          ],
        },
        is_toggleable: {
          type: "boolean",
          description: "Whether the heading can be toggled.",
        },
      },
    },
    bulleted_list_item: {
      type: "object",
      description: "Bulleted list item block object.",
      properties: {
        rich_text: {
          type: "array",
          description: "Array of rich text objects representing the list item content.",
          items: richTextObjectSchema,
        },
        color: {
          type: "string",
          description: "The color of the block.",
          enum: [
            "default",
            "blue",
            "blue_background",
            "brown",
            "brown_background",
            "gray",
            "gray_background",
            "green",
            "green_background",
            "orange",
            "orange_background",
            "pink",
            "pink_background",
            "purple",
            "purple_background",
            "red",
            "red_background",
            "yellow",
            "yellow_background",
          ],
        },
        children: {
          type: "array",
          description: "Nested child blocks.",
          items: {
            type: "object",
            description: "A nested block object.",
          },
        },
      },
    },
    numbered_list_item: {
      type: "object",
      description: "Numbered list item block object.",
      properties: {
        rich_text: {
          type: "array",
          description: "Array of rich text objects representing the list item content.",
          items: richTextObjectSchema,
        },
        color: {
          type: "string",
          description: "The color of the block.",
          enum: [
            "default",
            "blue",
            "blue_background",
            "brown",
            "brown_background",
            "gray",
            "gray_background",
            "green",
            "green_background",
            "orange",
            "orange_background",
            "pink",
            "pink_background",
            "purple",
            "purple_background",
            "red",
            "red_background",
            "yellow",
            "yellow_background",
          ],
        },
        children: {
          type: "array",
          description: "Nested child blocks.",
          items: {
            type: "object",
            description: "A nested block object.",
          },
        },
      },
    },
    divider: {
      type: "object",
      description: "Divider block object.",
      properties: {},
    },
  },
  required: ["object", "type"],
};
