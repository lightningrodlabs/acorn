FROM node:16

WORKDIR /app

COPY web/package.json web/package.json
COPY config-main-app-id .

WORKDIR /app/web

RUN npm install

COPY web .

ENV ADMIN_WS_PORT=1234 
ENV APP_WS_PORT=8888

CMD [ "npx", "webpack-dev-server", "--config", "webpack.dev.js" ]