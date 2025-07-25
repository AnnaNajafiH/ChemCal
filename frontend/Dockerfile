FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

EXPOSE 5173
#This lets Docker know the port that the container listens on.


CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
