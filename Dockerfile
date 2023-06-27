#syntax=docker/dockerfile:1.4

FROM tinygo/tinygo:0.28.1 AS wasm_build

WORKDIR /srv/app

COPY --link . .

RUN tinygo build -o pong.wasm -target wasm cmd/wasm/main.go


FROM node:18-alpine AS client_build

WORKDIR /srv/app

COPY --link . .
COPY --from=wasm_build /srv/app/pong.wasm .
COPY --from=wasm_build /usr/local/tinygo/targets/wasm_exec.js .

RUN npm i
RUN npm run build


FROM nginx:1.25-alpine AS client

COPY --from=client_build /srv/app/dist/ /www/data/
COPY ./docker/nginx.conf /etc/nginx/nginx.conf

FROM golang:1.20-alpine AS backend

WORKDIR /srv/app

COPY --link . .

RUN go install github.com/fkropfhamer/pong/cmd/pong

ENTRYPOINT ["pong"]