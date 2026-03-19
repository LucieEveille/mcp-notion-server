FROM node:20-slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/
RUN npx tsc

ENV PORT=3000
ENV NOTION_MARKDOWN_CONVERSION=true

EXPOSE 3000

CMD ["node", "build/index.js", "--transport", "http"]
