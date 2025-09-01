
FROM node:22-alpine

WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm ci --silent || npm i
COPY . .
RUN npm run build

EXPOSE 3000
#CMD ["node","dist/main.js"]
CMD ["npm", "run", "start:dev"]
