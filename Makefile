build: cleanup submodule npm-install
	npm run build

submodule:
	git submodule update --init --recursive

npm-install:
	npm install -f && cd src/frontend-elements && npm install -f && cd ../..

cleanup:
	rm -rf node_modules && rm -rf src/frontend-elements
