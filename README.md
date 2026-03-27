# Notion MCP Server — 精简版

一个**省 token** 的 Notion MCP Server，fork 自 [`suekou/mcp-notion-server`](https://github.com/suekou/mcp-notion-server)，对工具 schema 做了大幅瘦身，并新增了远程 HTTP 部署和页面创建等功能。

适合自建 AI 系统、在意 token 开销的开发者。

---

## 为什么要用这个 Fork？

MCP 工具的 schema 会作为上下文注入每一轮对话——不管你这轮用不用 Notion，每条消息都在为它买单。

三个 Notion MCP Server 的 token 开销对比：

| 版本 | 工具数 | Schema 体积 | 相比官方 |
|---|---|---|---|
| [**Notion 官方 MCP**](https://github.com/makenotion/notion-mcp-server) | 30+ | ~40,000+ tokens | — |
| [**suekou/mcp-notion-server**](https://github.com/suekou/mcp-notion-server)（上游） | 19 | ~27,700 tokens | -31% |
| **本项目**（13 工具 + Schema 瘦身） | 13 | **~10,130 tokens** | **-75%** |

两个优化手段叠加实现的：

| 优化手段 | 效果 | 说明 |
|---|---|---|
| **工具过滤**（`ENABLED_TOOLS`） | 19 → 13 个工具 | 启动时只注册你需要的工具 |
| **Schema 瘦身**（`common.ts`） | 373 → 155 行 | 删除只读字段、未使用的样式、颜色枚举 |

代码逻辑和上游完全一致——相同的 Notion API 版本、相同的工具名、相同的请求/响应格式。

### Schema 改了什么

`blockObjectSchema` 和 `richTextObjectSchema` 是 token 大户，每个写入工具都会嵌入它们。

**富文本（Rich Text）：** 删除了 `href`、`plain_text`（只读字段）、`strikethrough`、`underline`、`color`（18 个颜色枚举值）。保留 `bold`、`italic`、`code`。

**区块（Block）：** 删除了每种区块各自的 `color` 枚举（7 种区块 × 18 个值 = 126 个枚举项），删除标题的 `is_toggleable`。抽取了 `richTextArrayProp` 和 `childrenProp` 共享变量，消除重复定义。

**新增了 4 种区块类型：** `quote`（引用）、`callout`（标注）、`to_do`（待办）、`toggle`（折叠）——上游没有这些。

---

## 相比上游新增了什么

### 🌐 Streamable HTTP 远程部署

上游只支持 stdio（本地运行）。这个 fork 加了完整的 HTTP 服务器模式，可以部署到云端远程连接：

```bash
# HTTP 模式启动
node build/index.js --transport http --port 3000
```

- `POST /mcp` — MCP 端点（无状态模式，每个请求独立创建 server+transport）
- `GET /health` — 健康检查（不需要鉴权），返回 `{"status":"ok","tools":"all"}`
- 支持 Bearer Token 鉴权（`MCP_AUTH_TOKEN` 环境变量）
- 自带 CORS 头，支持跨域访问

### 📄 `notion_create_page` 工具

上游没有创建子页面的能力。这个 fork 新增了 `notion_create_page`：

- 在任意页面下创建子页面
- 在数据库中创建新条目
- 一次调用就能设置标题、图标、初始内容和属性
- 自动处理不同父级格式（`page_id` vs `database_id`）

### 🎛️ `ENABLED_TOOLS` 环境变量

不改代码，启动时控制注册哪些工具：

```bash
ENABLED_TOOLS=notion_retrieve_page,notion_append_block_children,notion_search
```

### 🐳 Docker 支持

```bash
docker build -t notion-mcp .
docker run -e NOTION_API_TOKEN=ntn_xxx -p 3000:3000 notion-mcp
```

### 🔧 UUID 自动格式化

所有 ID 输入会自动标准化为 `8-4-4-4-12` 格式。从 Notion URL 里复制的无连字符 ID 可以直接用。

---

## 快速开始

### 方式一：本地运行（stdio）—— Claude Desktop / Cursor 等

```bash
git clone https://github.com/LucieEveille/mcp-notion-server.git
cd mcp-notion-server
npm install
npm run build
```

在 `claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "notion": {
      "command": "node",
      "args": ["/你的路径/mcp-notion-server/build/index.js"],
      "env": {
        "NOTION_API_TOKEN": "ntn_你的token",
        "NOTION_MARKDOWN_CONVERSION": "true"
      }
    }
  }
}
```

### 方式二：远程部署（HTTP）—— 自建服务器

```bash
# 用 Docker
docker build -t notion-mcp .
docker run -e NOTION_API_TOKEN=ntn_xxx -p 3000:3000 notion-mcp

# 或者直接跑
NOTION_API_TOKEN=ntn_xxx npm start
```

MCP 客户端连接 `http://你的服务器:3000/mcp` 即可。

### 方式三：只启用你需要的工具

```bash
NOTION_API_TOKEN=ntn_xxx \
ENABLED_TOOLS=notion_retrieve_page,notion_retrieve_block_children,notion_append_block_children,notion_create_page,notion_search \
npm start
```

---

## 环境变量

| 变量 | 必填 | 默认值 | 说明 |
|---|---|---|---|
| `NOTION_API_TOKEN` | **是** | — | Notion Integration Token |
| `NOTION_MARKDOWN_CONVERSION` | 否 | `false` | 设为 `"true"` 返回 Markdown 格式（更省 token） |
| `ENABLED_TOOLS` | 否 | 全部 | 逗号分隔的工具名列表，只注册列出的工具 |
| `PORT` | 否 | `3000` | HTTP 服务端口 |
| `MCP_AUTH_TOKEN` | 否 | — | HTTP 端点的 Bearer Token 鉴权 |

## 命令行参数

| 参数 | 默认值 | 说明 |
|---|---|---|
| `--transport` | `stdio` | `"stdio"` 本地模式，`"http"` 远程模式 |
| `--port` | `3000` | HTTP 端口（覆盖 `PORT` 环境变量） |
| `--enabledTools` | 全部 | 逗号分隔的工具列表（覆盖 `ENABLED_TOOLS` 环境变量） |

---

## 工具列表

所有工具支持可选参数 `format`（`"json"` 或 `"markdown"`，默认 `"markdown"`）。Markdown 转换需要设置 `NOTION_MARKDOWN_CONVERSION=true`。

### 区块操作

| 工具 | 说明 |
|---|---|
| `notion_append_block_children` | 向父级区块追加子区块，支持 `after` 参数指定插入位置 |
| `notion_retrieve_block_children` | 获取区块的子区块列表，支持分页 |
| `notion_update_block` | 更新区块内容 |
| `notion_delete_block` | 删除（归档）区块 |
| `notion_retrieve_block` | 获取单个区块的元数据 |

### 页面操作

| 工具 | 说明 |
|---|---|
| `notion_retrieve_page` | 获取页面元数据和属性 |
| `notion_create_page` | **新增。** 创建子页面或数据库条目，支持标题、图标和初始内容 |
| `notion_update_page_properties` | 更新页面或数据库条目的属性 |

### 数据库操作

| 工具 | 说明 |
|---|---|
| `notion_query_database` | 查询数据库，支持筛选和排序 |
| `notion_create_database_item` | 在数据库中创建新条目 |
| `notion_retrieve_database` | 获取数据库结构和元数据 |
| `notion_create_database` | 创建新数据库 |
| `notion_update_database` | 更新数据库标题、描述或属性 |

### 搜索

| 工具 | 说明 |
|---|---|
| `notion_search` | 按标题搜索页面和数据库 |

### 评论

| 工具 | 说明 |
|---|---|
| `notion_create_comment` | 在页面或讨论串中创建评论 |
| `notion_retrieve_comments` | 获取页面或区块的未解决评论 |

### 用户操作

| 工具 | 说明 |
|---|---|
| `notion_list_all_users` | 列出工作区所有用户（需要企业版） |
| `notion_retrieve_user` | 按 ID 获取用户信息（需要企业版） |
| `notion_retrieve_bot_user` | 获取当前 token 对应的 bot 用户信息 |

---

## 项目结构

```
src/
├── index.ts              # 入口，命令行参数解析
├── client/
│   └── index.ts          # NotionClientWrapper — 所有 Notion API 调用
├── server/
│   └── index.ts          # MCP 服务器，stdio + HTTP 双模式
├── types/
│   ├── index.ts          # 类型导出
│   ├── args.ts           # 工具参数接口定义
│   ├── common.ts         # 精简后的 schema 定义（核心优化点）
│   ├── responses.ts      # Notion API 响应类型
│   └── schemas.ts        # MCP 工具 schema 定义
├── utils/
│   └── index.ts          # 工具过滤等辅助函数
└── markdown/
    └── index.ts          # JSON → Markdown 转换
```

---

## Notion 集成配置

1. 访问 [Notion Integrations](https://www.notion.so/profile/integrations)，创建新集成
2. 复制 **Internal Integration Token**（以 `ntn_` 开头）
3. 在 Notion 中打开你要访问的页面/数据库 → 点右上角 `···` → **连接** → 添加你的集成

## 常见问题

- **权限错误：** 确认你的集成已经连接到对应的页面/数据库。子页面会继承父页面的连接权限。
- **找不到工具：** 如果设置了 `ENABLED_TOOLS`，检查工具名是否在列表中。
- **HTTP 401：** 确认 `MCP_AUTH_TOKEN` 环境变量和请求头中的 `Authorization: Bearer <token>` 一致。

---

## 致谢

本项目 fork 自 [`suekou/mcp-notion-server`](https://github.com/suekou/mcp-notion-server)，感谢原作者提供了优秀的 Notion MCP 基础实现。Schema 瘦身、HTTP 传输和 `create_page` 工具是本 fork 的新增内容。

## 协议

MIT — 详见 [LICENSE](LICENSE)。

原始版权 (c) 2024 suekou。Fork 修改 (c) 2025–2026 Lucie Éveille。
