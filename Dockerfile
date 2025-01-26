FROM python:3.9.21 AS builder

RUN python3 -m pip install beautifulsoup4==4.12.3 lxml==5.3.0

COPY src /opt/website/src
COPY util/build_html /usr/local/bin

RUN mkdir -p /opt/website/build
RUN build_html \
    --src-directory /opt/website/src \
    --components-directory /opt/website/src/html/components \
    --icons-directory /opt/website/src/assets/icons \
    --build-directory /opt/website/build

FROM nginx:latest

COPY heatherward.dev.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /opt/website/build /usr/share/nginx/html
