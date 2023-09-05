# use node 18
FROM node:18

WORKDIR /usr/src/app

COPY package.json ./


RUN npm install -g pnpm@7.17.0
RUN pnpm install --prod

COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]

