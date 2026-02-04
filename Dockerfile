FROM node:22-alpine

# Install Python and build tools for native deps (e.g., gyp for Solana if any)
RUN apk add --no-cache python3 make g++ python3-dev

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]