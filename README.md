# cheqd Network Wallet

## ℹ️ Overview

[CHEQ Wallet](https://wallet.cheqd.io) allows users to perform standard DeFi activities on Cosmos such as staking/delegating, voting on governance Proposals, and sending tokens. Crucially, the CHEQ wallet goes one step further than this, offering the ability to store and share [Verifiable Credentials](https://learn.cheqd.io/overview/introduction-to-decentralised-identity/what-is-a-verifiable-credential-vc).

## 🔥 Features

- Access your CHEQ wallet account by connecting to the [Keplr browser extension](https://keplr.app).
- Send CHEQ tokens
- Delegate, undelegate and redelegate to validators
- BETA: Store and share digital identity credentials.

## 🧑‍💻🛠 Developer Guide

### Setup

There are two `package.json` in this repository. You can use a package manager like Yarn or NPM to install dependencies.

```bash
yarn install
cd src/frontend-elements
yarn install
cd ../..
```

### Build

You can build your app with Yarn or similar package managers.

```bash
yarn build
```

The installation and build steps can be executed together using the `Makefile` in this repository as well by using the command below:

```bash
make build
```

### Run

Serve the app by using this command:

```bash
yarn start
```

## 🙌 Acknowledgments

This repo is forked from the [LUM network wallet](https://github.com/lum-network/wallet) which also uses [Lum Network's Javascript SDK](https://github.com/lum-network/sdk-javascript).
