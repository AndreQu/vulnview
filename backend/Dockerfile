FROM golang:1.22-alpine AS builder

# Installiere gcc und sqlite-dev für CGO
RUN apk add --no-cache gcc musl-dev sqlite-dev

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# CGO_ENABLED=1 für SQLite
RUN CGO_ENABLED=1 GOOS=linux go build -a -o vulnview-backend .

FROM alpine:latest
RUN apk --no-cache add ca-certificates sqlite-libs
WORKDIR /root/

COPY --from=builder /app/vulnview-backend .

EXPOSE 18080

CMD ["./vulnview-backend"]
