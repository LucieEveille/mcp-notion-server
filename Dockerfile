FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# 构建完成后清理 dev 依赖，减小镜像体积
RUN npm prune --omit=dev

ENV PORT=3000
ENV NOTION_MARKDOWN_CONVERSION=true

EXPOSE 3000

CMD ["node", "build/index.js", "--transport", "http"]
