# Use a Node.js base image with Python pre-installed
FROM nikolaik/python-nodejs:python3.10-nodejs18

# Install system dependencies required for OpenCV / DeepFace
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend package configuration files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Install Python deep learning dependencies for facial recognition and tagging
RUN pip install --no-cache-dir deepface tf-keras opencv-python-headless

# Copy all application code
COPY . .

# Generate Prisma database client
RUN npx prisma generate

# Build TypeScript application
RUN npm run build

# Expose the server port (default 5000)
EXPOSE 5000

# Start the Node.js production server
CMD ["npm", "start"]
