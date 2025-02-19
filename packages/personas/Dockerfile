FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Install doctl for serverless deployment
RUN apk add --no-cache curl && \
    curl -L https://github.com/digitalocean/doctl/releases/download/v1.101.0/doctl-1.101.0-linux-amd64.tar.gz | tar xz && \
    mv doctl /usr/local/bin

# Expose port for local development
EXPOSE 8080

CMD ["npm", "run", "dev"] 