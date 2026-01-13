FROM node:18-alpine

WORKDIR /app

# Copy dashboard files
COPY dist/exam-dashboard-v2.html /app/
COPY dist/index.html /app/
COPY dist/dashboard-server.js /app/

# Install dependencies
RUN npm init -y && npm install express

# Expose port
EXPOSE 8080

# Run server
CMD ["node", "dashboard-server.js"]
