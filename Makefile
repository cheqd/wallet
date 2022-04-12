build: submodule sass-fix yarn-install
	yarn build

submodule:
	git submodule update --init

sass-fix:
	cd src/frontend-elements && yarn remove node-sass && yarn add sass && cd ../..

yarn-install:
	yarn && cd src/frontend-elements && yarn && cd ../..
