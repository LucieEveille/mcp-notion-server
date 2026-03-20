/**
 * Notion API client wrapper
 */

import { convertToMarkdown } from "../markdown/index.js";
import {
  NotionResponse,
  BlockResponse,
  PageResponse,
  DatabaseResponse,
  ListResponse,
  UserResponse,
  CommentResponse,
  RichTextItemResponse,
  CreateDatabaseArgs,
} from "../types/index.js";
import fetch from "node-fetch";

/**
 * Normalize a UUID to 8-4-4-4-12 format with hyphens.
 * Handles: no hyphens, wrong hyphen positions, or already correct.
 */
function nid(id: string): string {
  if (!id) return id;
  const clean = id.replace(/[-\s]/g, "");
  if (!/^[0-9a-fA-F]{32}$/.test(clean)) return id;
  return `${clean.slice(0,8)}-${clean.slice(8,12)}-${clean.slice(12,16)}-${clean.slice(16,20)}-${clean.slice(20)}`;
}

export class NotionClientWrapper {
  private notionToken: string;
  private baseUrl: string = "https://api.notion.com/v1";
  private headers: { [key: string]: string };

  constructor(token: string) {
    this.notionToken = token;
    this.headers = {
      Authorization: `Bearer ${this.notionToken}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    };
  }

  async appendBlockChildren(
    block_id: string,
    children: Partial<BlockResponse>[]
  ): Promise<BlockResponse> {
    const body = { children };

    const response = await fetch(
      `${this.baseUrl}/blocks/${nid(block_id)}/children`,
      {
        method: "PATCH",
        headers: this.headers,
        body: JSON.stringify(body),
      }
    );

    return response.json();
  }

  async retrieveBlock(block_id: string): Promise<BlockResponse> {
    const response = await fetch(`${this.baseUrl}/blocks/${nid(block_id)}`, {
      method: "GET",
      headers: this.headers,
    });

    return response.json();
  }

  async retrieveBlockChildren(
    block_id: string,
    start_cursor?: string,
    page_size?: number
  ): Promise<ListResponse> {
    const params = new URLSearchParams();
    if (start_cursor) params.append("start_cursor", start_cursor);
    if (page_size) params.append("page_size", page_size.toString());

    const response = await fetch(
      `${this.baseUrl}/blocks/${nid(block_id)}/children?${params}`,
      {
        method: "GET",
        headers: this.headers,
      }
    );

    return response.json();
  }

  async deleteBlock(block_id: string): Promise<BlockResponse> {
    const response = await fetch(`${this.baseUrl}/blocks/${nid(block_id)}`, {
      method: "DELETE",
      headers: this.headers,
    });

    return response.json();
  }

  async updateBlock(
    block_id: string,
    block: Partial<BlockResponse>
  ): Promise<BlockResponse> {
    const response = await fetch(`${this.baseUrl}/blocks/${nid(block_id)}`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify(block),
    });

    return response.json();
  }

  async retrievePage(page_id: string): Promise<PageResponse> {
    const response = await fetch(`${this.baseUrl}/pages/${nid(page_id)}`, {
      method: "GET",
      headers: this.headers,
    });

    return response.json();
  }

  async updatePageProperties(
    page_id: string,
    properties: Record<string, any>
  ): Promise<PageResponse> {
    const body = { properties };

    const response = await fetch(`${this.baseUrl}/pages/${nid(page_id)}`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    return response.json();
  }

  async listAllUsers(
    start_cursor?: string,
    page_size?: number
  ): Promise<ListResponse> {
    const params = new URLSearchParams();
    if (start_cursor) params.append("start_cursor", start_cursor);
    if (page_size) params.append("page_size", page_size.toString());

    const response = await fetch(`${this.baseUrl}/users?${params.toString()}`, {
      method: "GET",
      headers: this.headers,
    });
    return response.json();
  }

  async retrieveUser(user_id: string): Promise<UserResponse> {
    const response = await fetch(`${this.baseUrl}/users/${nid(user_id)}`, {
      method: "GET",
      headers: this.headers,
    });
    return response.json();
  }

  async retrieveBotUser(): Promise<UserResponse> {
    const response = await fetch(`${this.baseUrl}/users/me`, {
      method: "GET",
      headers: this.headers,
    });
    return response.json();
  }

  async createDatabase(
    parent: CreateDatabaseArgs["parent"],
    properties: Record<string, any>,
    title?: RichTextItemResponse[]
  ): Promise<DatabaseResponse> {
    const body = { parent, title, properties };

    const response = await fetch(`${this.baseUrl}/databases`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    return response.json();
  }

  async queryDatabase(
    database_id: string,
    filter?: Record<string, any>,
    sorts?: Array<{
      property?: string;
      timestamp?: string;
      direction: "ascending" | "descending";
    }>,
    start_cursor?: string,
    page_size?: number
  ): Promise<ListResponse> {
    const body: Record<string, any> = {};
    if (filter) body.filter = filter;
    if (sorts) body.sorts = sorts;
    if (start_cursor) body.start_cursor = start_cursor;
    if (page_size) body.page_size = page_size;

    const response = await fetch(
      `${this.baseUrl}/databases/${nid(database_id)}/query`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(body),
      }
    );

    return response.json();
  }

  async retrieveDatabase(database_id: string): Promise<DatabaseResponse> {
    const response = await fetch(`${this.baseUrl}/databases/${nid(database_id)}`, {
      method: "GET",
      headers: this.headers,
    });

    return response.json();
  }

  async updateDatabase(
    database_id: string,
    title?: RichTextItemResponse[],
    description?: RichTextItemResponse[],
    properties?: Record<string, any>
  ): Promise<DatabaseResponse> {
    const body: Record<string, any> = {};
    if (title) body.title = title;
    if (description) body.description = description;
    if (properties) body.properties = properties;

    const response = await fetch(`${this.baseUrl}/databases/${nid(database_id)}`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    return response.json();
  }

  async createDatabaseItem(
    database_id: string,
    properties: Record<string, any>
  ): Promise<PageResponse> {
    const body = {
      parent: { database_id: nid(database_id) },
      properties,
    };

    const response = await fetch(`${this.baseUrl}/pages`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    return response.json();
  }

  async createPage(
    parent_id: string,
    parent_type: "page_id" | "database_id",
    title: string,
    children?: Partial<BlockResponse>[],
    properties?: Record<string, any>,
    icon?: { type: string; emoji?: string }
  ): Promise<PageResponse> {
    const body: Record<string, any> = {
      parent: { [parent_type]: nid(parent_id) },
    };

    if (parent_type === "page_id") {
      // Page parent: title goes in properties as a title property
      body.properties = {
        title: [{ text: { content: title } }],
        ...properties,
      };
    } else {
      // Database parent: title goes in properties.Name or provided properties
      body.properties = properties || {
        Name: { title: [{ text: { content: title } }] },
      };
    }

    if (children && children.length > 0) {
      body.children = children;
    }
    if (icon) {
      body.icon = icon;
    }

    const response = await fetch(`${this.baseUrl}/pages`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    return response.json();
  }

  async createComment(
    parent?: { page_id: string },
    discussion_id?: string,
    rich_text?: RichTextItemResponse[]
  ): Promise<CommentResponse> {
    const body: Record<string, any> = { rich_text };
    if (parent) {
      body.parent = { page_id: nid(parent.page_id) };
    }
    if (discussion_id) {
      body.discussion_id = nid(discussion_id);
    }

    const response = await fetch(`${this.baseUrl}/comments`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    return response.json();
  }

  async retrieveComments(
    block_id: string,
    start_cursor?: string,
    page_size?: number
  ): Promise<ListResponse> {
    const params = new URLSearchParams();
    params.append("block_id", nid(block_id));
    if (start_cursor) params.append("start_cursor", start_cursor);
    if (page_size) params.append("page_size", page_size.toString());

    const response = await fetch(
      `${this.baseUrl}/comments?${params.toString()}`,
      {
        method: "GET",
        headers: this.headers,
      }
    );

    return response.json();
  }

  async search(
    query?: string,
    filter?: { property: string; value: string },
    sort?: {
      direction: "ascending" | "descending";
      timestamp: "last_edited_time";
    },
    start_cursor?: string,
    page_size?: number
  ): Promise<ListResponse> {
    const body: Record<string, any> = {};
    if (query) body.query = query;
    if (filter) body.filter = filter;
    if (sort) body.sort = sort;
    if (start_cursor) body.start_cursor = start_cursor;
    if (page_size) body.page_size = page_size;

    const response = await fetch(`${this.baseUrl}/search`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    return response.json();
  }

  async toMarkdown(response: NotionResponse): Promise<string> {
    return convertToMarkdown(response);
  }
}
