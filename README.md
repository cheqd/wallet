# cheqd Wallet

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/cheqd/wallet?color=green&label=stable%20release&style=flat-square)](https://github.com/cheqd/wallet/releases/latest) ![GitHub Release Date](https://img.shields.io/github/release-date/cheqd/wallet?color=green&style=flat-square) [![GitHub license](https://img.shields.io/github/license/cheqd/wallet?color=blue&style=flat-square)](https://github.com/cheqd/wallet/blob/cheqd/LICENSE)

[![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/cheqd/wallet?include_prereleases&label=dev%20release&style=flat-square)](https://github.com/cheqd/wallet/releases/) ![GitHub commits since latest release (by date)](https://img.shields.io/github/commits-since/cheqd/wallet/latest?style=flat-square) [![GitHub contributors](https://img.shields.io/github/contributors/cheqd/wallet?label=contributors%20%E2%9D%A4%EF%B8%8F&style=flat-square)](https://github.com/cheqd/wallet/graphs/contributors)

[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/cheqd/wallet/Workflow%20Dispatch?label=workflows&style=flat-square)](https://github.com/cheqd/wallet/actions/workflows/dispatch.yml) [![GitHub Workflow Status](https://img.shields.io/github/workflow/status/cheqd/wallet/CodeQL?label=CodeQL&style=flat-square)](https://github.com/cheqd/wallet/actions/workflows/codeql.yml) ![GitHub repo size](https://img.shields.io/github/repo-size/cheqd/wallet?style=flat-square)

## ℹ️ Overview

[cheqd Wallet](https://wallet.cheqd.io) allows users to perform standard DeFi activities on Cosmos such as staking/delegating, voting on governance Proposals, and sending tokens. Crucially, the cheqd Wallet goes one step further than this, offering the ability to store and share [Verifiable Credentials](https://learn.cheqd.io/overview/introduction-to-decentralised-identity/what-is-a-verifiable-credential-vc).

## 🔥 Features

- Access your CHEQ wallet account by connecting to the [Keplr browser extension](https://keplr.app).
- Send CHEQ tokens
- Delegate, undelegate and redelegate to validators
- BETA: Store and share digital identity credentials.

## 🧑‍💻🛠 Developer Guide

### Setup

You can use a package manager like NPM to install dependencies. The `env.example` file is renamed to `.env` in the first step and contains environment variables that need to be configured for the application to run correctly.

```bash
mv env.example .env
npm install
```

### Build

You can build your app with NPM

```bash
npm run build
```

The build script uses [Vite](https://vitejs.dev/) to execute the build.

### Run

Serve the app by using this command:

```bash
npm start
```

### Acknowledgments

This repo is forked from the [LUM network wallet](https://github.com/lum-network/wallet) which also uses [Lum Network's Javascript SDK](https://github.com/lum-network/sdk-javascript).

## 💬 Community

The [**cheqd Community Slack**](http://cheqd.link/join-cheqd-slack) is our primary chat channel for the open-source community, software developers, and node operators.

Please reach out to us there for discussions, help, and feedback on the project.

## 🙋 Find us elsewhere

[![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge\&logo=telegram\&logoColor=white)](https://t.me/cheqd) [![Discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge\&logo=discord\&logoColor=white)](http://cheqd.link/discord-github) [![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge\&logo=twitter\&logoColor=white)](https://twitter.com/intent/follow?screen\_name=cheqd\_io) [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge\&logo=linkedin\&logoColor=white)](http://cheqd.link/linkedin) [![Slack](https://img.shields.io/badge/Slack-4A154B?style=for-the-badge\&logo=slack\&logoColor=white)](http://cheqd.link/join-cheqd-slack) [![Medium](https://img.shields.io/badge/Medium-12100E?style=for-the-badge\&logo=medium\&logoColor=white)](https://blog.cheqd.io) [![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge\&logo=youtube\&logoColor=white)](https://www.youtube.com/channel/UCBUGvvH6t3BAYo5u41hJPzw/)
