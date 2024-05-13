FROM node:16.20

COPY . /app/api

WORKDIR /app/api

CMD [ "npm", "run", "dev" ]