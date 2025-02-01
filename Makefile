IMAGE_VERSION := $(shell git rev-parse --short HEAD)
IMAGE_TAG = registry.somanydoors.ca/heather/heatherward-dev:$(IMAGE_VERSION)

clean:
	rm -rf build

build:
	./util/build_html \
		--src-directory $$PWD/src \
		--components-directory $$PWD/src/html/components \
		--icons-directory $$PWD/src/assets/icons \
		--build-directory $$PWD/build

docker-build:
	docker build --rm -t $(IMAGE_TAG) .

local: build docker-build
	docker run --rm -it --network host -v $$PWD/build:/usr/share/nginx/html $(IMAGE_TAG)

docker-push: docker-build
	docker push $(IMAGE_TAG)

# The build directory name conflicts with the build make target; must set to phony to have it rerun this
.PHONY: build
