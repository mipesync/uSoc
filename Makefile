.SILENT:
.PHONY: build run

DEFAULT_GOAL: run

build:
	docker build --no-cache=true -t u-soc-main .

run: build
	docker-compose up