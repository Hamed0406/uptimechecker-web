SHELL := /usr/bin/env bash
COMPOSE ?= docker compose

.PHONY: up down logs rebuild

up:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down -v --remove-orphans

logs:
	$(COMPOSE) logs -f web

rebuild:
	$(COMPOSE) build --no-cache web
