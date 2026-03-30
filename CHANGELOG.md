# Changelog

## 2024-03-30 Bug Fixes

### 1. `appendBlockChildren` 的 `after` 参数未传递（严重）

**文件：** `src/client/index.ts`, `src/server/index.ts`

Schema 和类型定义中声明了 `after` 参数，允许用户在指定 block 之后插入内容，但该参数从未传递给 Notion API。

**修复：**
- `NotionClientWrapper.appendBlockChildren()` 方法签名新增 `after?: string` 参数
- 当 `after` 存在时，将其通过 `nid()` 格式化后加入请求体
- 服务端调用处补充传递 `args.after`

### 2. `page_size` 为 0 时被错误跳过（中等）

**文件：** `src/client/index.ts`

多处使用 `if (page_size)` 进行 falsy 检查，当 `page_size === 0` 时条件为 false，参数被静默丢弃。

**修复：** 将所有 `if (page_size)` 改为 `if (page_size !== undefined)`。

**涉及方法：**
- `retrieveBlockChildren`
- `listAllUsers`
- `queryDatabase`
- `retrieveComments`
- `search`

### 3. `createPage` 的 title 属性结构错误（严重）

**文件：** `src/client/index.ts`

当 `parent_type === "page_id"` 时，title 的 properties 格式不符合 Notion API 规范。

**修复前：**
```typescript
body.properties = {
  title: [{ text: { content: title } }],
};
```

**修复后：**
```typescript
body.properties = {
  title: { title: [{ text: { content: title } }] },
};
```

### 4. Markdown 转换缺少 `user` 和 `comment` 类型处理

**文件：** `src/markdown/index.ts`

`convertToMarkdown` 的 switch 语句没有 `user` 和 `comment` 分支，导致 `listAllUsers`、`retrieveUser`、`retrieveBotUser`、`createComment`、`retrieveComments` 等工具在 markdown 模式下返回原始 JSON。

**修复：**
- 新增 `convertUserToMarkdown()`：将用户信息格式化为表格（ID、类型、邮箱、头像）
- 新增 `convertCommentToMarkdown()`：将评论格式化为引用块 + 元数据（创建时间、作者、讨论 ID）
