# Stage 1: Build the frontend
FROM --platform=linux/amd64 node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the backend
FROM --platform=linux/amd64 golang:1.17 AS backend-builder
WORKDIR /app/backend
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o app

# add a comment

# Stage 3: Create the final image
FROM --platform=linux/amd64 nginx:alpine
RUN apk --no-cache add ca-certificates supervisor
COPY --from=frontend-builder /app/frontend/build /usr/share/nginx/html
COPY --from=backend-builder /app/backend/app ./
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf
EXPOSE 80

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
