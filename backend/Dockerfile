# Dockerfile for PulsePoll Go Gin Backend
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install git and ca-certificates
RUN apk add --no-cache git ca-certificates

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o pulsepoll-server .

# Production runner image
FROM alpine:3.19

WORKDIR /app
RUN apk --no-cache add ca-certificates tzdata

COPY --from=builder /app/pulsepoll-server .

EXPOSE 8080

CMD ["./pulsepoll-server"]
