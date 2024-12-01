local:
	docker run --rm -it --network host -v $$PWD/src:/usr/share/nginx/html nginx:latest
