FROM node:20

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package.json .
COPY yarn.lock .
RUN yarn install

COPY . .

CMD ["yarn", "start"]
