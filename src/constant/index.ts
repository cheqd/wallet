export const IS_TESTNET = process.env.REACT_APP_RPC_URL.includes('network');

export const CHEQ_ASSETS_GITHUB = 'https://github.com/cheqd/public-assets';
export const CHEQ_WALLET_GITHUB = 'https://github.com/cheqd/wallet';
export const CHEQ_MAIL = 'contact@cheqd.io';
export const CHEQ_TELEGRAM = 'https://t.me/cheqd';
export const CHEQ_TWITTER = 'https://twitter.com/cheqd_io';
export const CHEQ_DISCORD = 'https://discord.gg/';
export const CHEQ_LEDGER_APP_INSTALL_LINK = 'https://github.com/cheqd/ledger-app#download-and-install-a-prerelease';
export const COSMOS_LEDGER_APP_INSTALL_LINK =
    'https://support.ledger.com/hc/en-us/articles/360013713840-Cosmos-ATOM-?docs=true';
export const KEPLR_INSTALL_LINK = 'https://keplr.app';
export const CHEQ_EXPLORER = IS_TESTNET ? 'https://testnet-explorer.cheqd.io/' : 'https://explorer.cheqd.net';
export const CHEQ_WALLET = IS_TESTNET ? 'https://wallet.testnet.cheqd.network' : 'https://wallet.cheqd.net';
export const CHEQ_COINGECKO_ID = 'cheqd-network';

export const CLIENT_PRECISION = 1_000_000_000_000_000_000;

export const MEDIUM_AIRDROP_ARTICLE = 'https://blog.cheqd.io/cosmos-community-airdrop-32fdb1c0cfd0';

export const KEPLR_DEFAULT_COIN_TYPE = 118;

export const OSMOSIS_API_URL = 'https://api-osmosis.imperator.co';

export const BUY_CHEQ_URL = 'https://app.osmosis.zone/?from=ATOM&to=CHEQ';
