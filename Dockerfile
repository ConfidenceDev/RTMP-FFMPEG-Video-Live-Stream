FROM node:16-alpine
# Install ffmpeg
RUN apk update && apk add --no-cache ffmpeg
# Set the working directory to /app
WORKDIR /app
COPY package*.json ./
# COPY package.json yarn.lock ./
RUN npm install
COPY . ./
ENV PORT 5000
EXPOSE 5000
CMD ["node", "app.js"]