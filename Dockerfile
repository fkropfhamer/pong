#syntax=docker/dockerfile:1.4

FROM node:18-alpine AS client_build

WORKDIR /srv/app

COPY --link . .

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