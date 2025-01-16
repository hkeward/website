IMAGE_VERSION := $(shell git rev-parse --short HEAD)

local: build
	docker run --rm -it --network host -v $$PWD/src:/usr/share/nginx/html registry.somanydoors.ca/heather/heatherward-dev:$(IMAGE_VERSION)

build:
	docker build --rm -t registry.somanydoors.ca/heather/heatherward-dev:$(IMAGE_VERSION) .
	docker tag registry.somanydoors.ca/heather/heatherward-dev:$(IMAGE_VERSION) registry.somanydoors.ca/heather/heatherward-dev:latest

deploy: build
	docker push registry.somanydoors.ca/heather/heatherward-dev:$(IMAGE_VERSION)
	docker push registry.somanydoors.ca/heather/heatherward-dev:latest
