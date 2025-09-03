FROM node:20-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy app source
COPY . .

# Create uploads directory with proper permissions
USER root
RUN mkdir -p /usr/src/app/uploads/avatars && \
    mkdir -p /usr/src/app/uploads/documents && \
    chown -R node:node /usr/src/app && \
    chmod -R 755 /usr/src/app/uploads

# Switch to node user
USER node

# Expose the port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Command to run the application
CMD ["node", "--trace-warnings", "index.js"]