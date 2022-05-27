build: submodule npm-install
	npm run build

submodule:
	git submodule update --init --recursive

npm-install:
	npm install -f && cd src/frontend-elements && npm install -f && cd ../..
