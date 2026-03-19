FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

ENV PORT=3000
ENV NOTION_MARKDOWN_CONVERSION=true

EXPOSE 3000

CMD ["node", "build/index.js", "--transport", "http"]
