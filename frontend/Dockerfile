FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

EXPOSE 3000

# Use dev mode instead of build
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]