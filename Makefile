IMAGE_VERSION := $(shell git rev-parse --short HEAD)

build:
	docker build --rm -t registry.somanydoors.ca/heather/heatherward-dev:$(IMAGE_VERSION) .

local: build
	docker run --rm -it --network host -v $$PWD/src:/usr/share/nginx/html registry.somanydoors.ca/heather/heatherward-dev:$(IMAGE_VERSION)

deploy: build
	docker push registry.somanydoors.ca/heather/heatherward-dev:$(IMAGE_VERSION)
