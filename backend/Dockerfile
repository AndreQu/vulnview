FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o vulnview-backend .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/vulnview-backend .

# SQLite DB wird im Container gespeichert
VOLUME ["/root/data"]
ENV DB_PATH=/root/data/vulnview.db

EXPOSE 8443

CMD ["./vulnview-backend"]
