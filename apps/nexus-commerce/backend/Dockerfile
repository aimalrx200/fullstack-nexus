FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code
COPY . .

# Hugging Face Spaces exposes port 7860 by default
ENV PORT=7860
ENV NODE_ENV=production

EXPOSE 7860

CMD ["node", "src/index.js"]