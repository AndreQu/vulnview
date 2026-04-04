FROM golang:1.22-alpine AS builder

RUN apk add --no-cache gcc musl-dev sqlite-dev

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=1 GOOS=linux go build -a -o vulnview-backend .

FROM alpine:latest
RUN apk --no-cache add ca-certificates sqlite-libs
WORKDIR /root/

COPY --from=builder /app/vulnview-backend .
COPY --from=builder /app/init.sql ./init.sql

# SQLite DB mit Schema erstellen
RUN mkdir -p /data
ENV DB_PATH=/data/vulnview.db
ENV DB_SCHEMA_PATH=/root/init.sql
ENV PORT=18080

EXPOSE 18080

CMD ["./vulnview-backend"]
