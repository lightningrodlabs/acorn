FROM node:19

WORKDIR /app

COPY .env /app
COPY electron/package.json ./electron/package.json

WORKDIR /app/electron

RUN npm install

COPY electron .

CMD [ "npm", "run", "start" ]