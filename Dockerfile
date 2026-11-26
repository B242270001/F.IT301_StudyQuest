# StudyQuest — нэг image: React frontend build + Express backend (frontend-ийг /dist-ээс үйлчилнэ)
# Ажиллуулах: docker compose up --build   →   http://localhost:4000

# ---------- 1. Frontend build ----------
FROM node:22-bookworm-slim AS web
WORKDIR /app
COPY package.json package-lock.json ./
# postinstall (backend install)-ыг алгасна — backend-ийг 2-р шатанд тусад нь суулгана
RUN npm ci --ignore-scripts
COPY index.html vite.config.js ./
COPY public ./public
COPY frontend ./frontend
RUN npx vite build

# ---------- 2. Backend runtime ----------
FROM node:22-bookworm-slim
ENV NODE_ENV=production \
    PORT=4000
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY backend/src ./src
# app.js нь ../../dist-ийг (= /app/dist) үйлчилнэ
COPY --from=web /app/dist /app/dist

USER node
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]
