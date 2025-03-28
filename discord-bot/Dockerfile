# Base image
FROM oven/bun:latest

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and lockfile for dependency installation
COPY package.json bun.lock ./

# Install all dependencies
RUN bun install --frozen-lockfile

# Copy all source files into the working directory
COPY . .

# Set environment variable for production
ENV NODE_ENV=production

# Command to run the bot
CMD ["bun", "run", "src/bot.ts"]