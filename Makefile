local: build
	docker run --rm -it --network host -v $$PWD/src:/usr/share/nginx/html hkeward/website:latest

build:
	docker build --rm -t hkeward/website:latest .
