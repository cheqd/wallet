build: submodule yarn-install
	yarn build

submodule:
	git submodule update --init --recursive && git submodule update --remote --merge

yarn-install:
	yarn && cd src/frontend-elements && yarn && cd ../..
