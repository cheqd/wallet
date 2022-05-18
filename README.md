# cheqd: CHEQ Wallet

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## ℹ️ Overview

[CHEQ Wallet](https://wallet.cheqd.io) gives a single wallet for users to manage their CHEQ wallets, and try out the new digital identity functionality we're building on our network.

The [CHEQ Wallet](https://wallet.cheqd.io) was built using the [Lum Network Wallet](https://wallet.lum.network/home) as a base. This allows users to perform standard DeFi activities on Cosmos such as Staking / Delegating, Voting on Governance Proposals, and sending tokens. Crucially, the CHEQ wallet goes one step further than this, offering the ability to store and share [Verifiable Credentials](https://learn.cheqd.io/overview/introduction-to-decentralised-identity/what-is-a-verifiable-credential-vc). 

## 🔥 Features

- Access your CHEQ wallet account by connecting to the [Keplr browser extension](https://keplr.app).
- Send CHEQ tokens
- Delegate, undelegate and redelegate to validators
- BETA: Store and share digital identity credentials.

## 🛠 Setup

### Install dependencies

There are two `package.json` in this repository:

> $ yarn && cd src/frontend-elements && yarn && cd ../..

### Run the web app

Now you can run your app with:

> $ yarn start

### Build the web app

You can build your app with:

> $ yarn build

## 🙌 Acknowledgments

As mentioned, this repo is forked from the [LUM network wallet](https://github.com/lum-network/wallet) which also uses [Lum Network's Javascript SDK](https://github.com/lum-network/sdk-javascript).
