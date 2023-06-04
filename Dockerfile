FROM node:16.20.0 AS clientBuilder
WORKDIR /app

COPY ./client/. /app
RUN npm ci
RUN npm run build



FROM golang:1.19 AS serverBuilder
WORKDIR /app

COPY ./server/. /app
RUN go mod download
RUN CGO_ENABLED=0 go build -a -installsuffix cgo -o app



FROM alpine:latest
WORKDIR /app

RUN mkdir ./client
RUN mkdir ./client/build/
RUN mkdir ./server

COPY --from=serverBuilder /app/app ./server
COPY --from=clientBuilder /app/build ./client/build/

EXPOSE 5000

CMD ["./server/app"]

