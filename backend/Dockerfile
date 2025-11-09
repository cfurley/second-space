# Use the official Node.js 22 image as the base image
FROM node:22

# Set the working directory inside the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies listed in package.json
RUN npm install

# Copy the rest of the application code to the working directory
COPY . ./

# Expose port 8080 for the application
EXPOSE 8080

# Start the application using npm
CMD ["npm", "start"]