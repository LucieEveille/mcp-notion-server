FROM node:20-slim

WORKDIR /app

COPY package.json ./
RUN npm install --ignore-scripts

COPY tsconfig.json ./
COPY src/ ./src/
RUN npx tsc && node -e "require('fs').chmodSync('build/index.js', '755')"

ENV PORT=3000
ENV NOTION_MARKDOWN_CONVERSION=true

EXPOSE 3000

CMD ["node", "build/index.js", "--transport", "http"]
