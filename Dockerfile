# Use an official Node.js runtime as a parent image
FROM node:14-alpine

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to /app
COPY package*.json ./

# Install dependencies
RUN npm Install

# Copy the current directory contents to /app
COPY . .

# Make port 3000 available to the world outside this container 
EXPOSE 3000

# Run app.js when the container launches
CMD ["npm", "start"]