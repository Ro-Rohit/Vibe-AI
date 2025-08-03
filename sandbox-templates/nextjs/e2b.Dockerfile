# FROM node:21-slim

# # Install curl
# RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*

# COPY compile_page.sh /compile_page.sh
# RUN chmod +x /compile_page.sh

# WORKDIR /home/user/nextjs-app

# # Initialize Next.js app (non-interactively)
# RUN npx --yes create-next-app@latest . --yes --no-install --use-npm

# # Setup ShadCN (optional, can be done post-build if needed)
# RUN npx  shadcn@latest init --yes -b neutral --force
# RUN npx  shadcn@latest add --all --yes

# # Move app to /home/user
# RUN mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app

FROM node:21-slim

# Install curl
RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy local pre-built app (excluding node_modules due to .dockerignore)
COPY . .

# Copy script (important this comes AFTER `WORKDIR`)
COPY compile_page.sh /compile_page.sh

# Add execute permission to your script if needed
RUN chmod +x /compile_page.sh

# Install dependencies
RUN npm install

# Expose Next.js dev port
EXPOSE 3000

