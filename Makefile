build: submodule yarn-install
	yarn build

submodule:
	git submodule update --init --remote --merge

yarn-install:
	yarn && cd src/frontend-elements && yarn && cd ../..
