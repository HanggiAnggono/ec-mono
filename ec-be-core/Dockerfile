FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock ./

COPY ca.pem /usr/local/share/ca-certificates/zscaler_root_ca.pem

ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/zscaler_root_ca.pem

RUN yarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "start:dev", "--preserveWatchOutput"]
