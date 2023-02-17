FROM node:alpine
WORKDIR .
COPY package*.json ./
RUN npm install
COPY . .
#COPY .dist .dist
CMD ["npm", "run", "start:dev"]
