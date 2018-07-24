FILES = $(shell find src -type f -iname "*.ts" | sed 's/ts/js/g')
SHELL := /bin/bash

all: $(FILES)

install:
	npm install

serve:
	node -r dotenv/config src/index.js

clean:
	rm -r ./src/*.js

src/%.js: src/%.ts
	@echo Compiling typescript files...
	tsc
