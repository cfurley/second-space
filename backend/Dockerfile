FROM node:22							# Use the official Node.js 22 image as the base image
WORKDIR /app							# Set the working directory inside the container to /app
COPY package*.json ./					# Copy package.json and package-lock.json to the working directory
RUN npm install							# Install the dependencies listed in package.json
COPY . ./								# Copy the rest of the application code to the working directory
EXPOSE 8080								# Expose port 8080 for the application
CMD ["npm", "start"]					# Start the application using npm