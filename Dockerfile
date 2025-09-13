# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Expose port (optional, default 3000 for Express)
EXPOSE 3000

# Run the dev script
CMD ["npm", "run", "dev"]
