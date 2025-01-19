IMAGE_VERSION := $(shell git rev-parse --short HEAD)
IMAGE_TAG = registry.somanydoors.ca/heather/heatherward-dev:$(IMAGE_VERSION)

clean:
	rm -rf build

build: clean
	./util/build_html --src-directory $$PWD/src --components-directory $$PWD/src/html/components --build-directory $$PWD/build

docker-build:
	docker build --rm -t $(IMAGE_TAG) .

local: build docker-build
	docker run --rm -it --network host -v $$PWD/build:/usr/share/nginx/html -v $$PWD/src/css:/usr/share/nginx/html/css $(IMAGE_TAG)

docker-push: docker-build
	docker push $(IMAGE_TAG)
