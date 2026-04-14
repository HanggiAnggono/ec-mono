FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

COPY ca.pem /usr/local/share/ca-certificates/zscaler_root_ca.pem

ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/zscaler_root_ca.pem

RUN npm install -g pnpm && pnpm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev", "--preserveWatchOutput"]
