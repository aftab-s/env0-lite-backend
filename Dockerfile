# Bagel Backend Docker Image
FROM node:20-alpine

# Install system dependencies for Terraform and AWS CLI
RUN apk add --no-cache \
    curl \
    wget \
    unzip \
    git \
    bash \
    python3 \
    py3-pip \
    && rm -rf /var/cache/apk/*

# Install Terraform
ENV TERRAFORM_VERSION=1.6.2
RUN wget https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip \
    && unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip \
    && mv terraform /usr/local/bin/ \
    && rm terraform_${TERRAFORM_VERSION}_linux_amd64.zip

# Install AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf awscliv2.zip aws/

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies for TypeScript build)
RUN npm ci && npm cache clean --force

# Copy application source code
COPY . .

# Build the TypeScript application
RUN npm run build

# Remove devDependencies after build to reduce image size
RUN npm prune --production

# Create non-root user for security
RUN addgroup -g 1001 -S bagel && \
    adduser -S bagel -u 1001 -G bagel

# Create workspace directory for Terraform operations
RUN mkdir -p /workspace && \
    chown -R bagel:bagel /app /workspace

# Switch to non-root user
USER bagel

# Expose application port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/ || exit 1

# Start the application
CMD ["npm", "start"]