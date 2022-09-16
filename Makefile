build: submodule yarn-install
	yarn build

start: submodule yarn-install
	yarn start

submodule:
	git submodule update --init --remote --merge

yarn-install:
	yarn && cd src/frontend-elements && yarn && cd ../..
