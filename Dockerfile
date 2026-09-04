FROM node:20-bookworm-slim
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev
COPY server/ ./
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "server.js"]
