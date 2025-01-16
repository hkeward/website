FROM nginx:latest

COPY src/* /usr/share/nginx/html/

COPY heatherward.dev.conf /etc/nginx/conf.d/default.conf
