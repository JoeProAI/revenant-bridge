FROM node:22

# Install Python and build tools for native deps (if any)
RUN apt-get update && apt-get install -y python3 python3-pip make g++ build-essential

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]