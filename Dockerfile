FROM nginx:alpine-slim

COPY . /usr/share/nginx/html

EXPOSE 3000