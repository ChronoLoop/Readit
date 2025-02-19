FROM node:20.11.1 AS clientBuilder
WORKDIR /app

COPY ./client/. /app
RUN npm i -g pnpm@10.4.1
RUN pnpm i --frozen-lockfile
RUN pnpm run build



FROM golang:1.22.1-alpine AS serverBuilder
WORKDIR /app

COPY ./server/. /app
RUN go mod download
RUN GOOS=linux go build -ldflags="-s -w" -o app



FROM alpine:latest
WORKDIR /app

RUN mkdir ./client
RUN mkdir ./client/build/
RUN mkdir ./server

COPY --from=serverBuilder /app/app ./server
COPY --from=serverBuilder /app/db/migrations ./server/db/migrations/
COPY --from=clientBuilder /app/build ./client/build/

EXPOSE 5000

CMD ["./server/app"]
