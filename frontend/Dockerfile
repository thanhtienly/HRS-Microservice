# Stage 1: Build the application
FROM node:alpine AS builder
WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run the application
FROM node:alpine
WORKDIR /usr/app
COPY --from=builder /usr/app/.next ./.next
COPY --from=builder /usr/app/public ./public
COPY --from=builder /usr/app/package.json ./package.json
RUN npm install --production

EXPOSE 3000
CMD ["npm", "start"]