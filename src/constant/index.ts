export const IS_TESTNET = import.meta.env.VITE_RPC_ENDPOINT.includes('network');

export const CHEQ_WALLET_GITHUB = 'https://github.com/cheqd/wallet';
export const CHEQ_MAIL = 'contact@cheqd.io';
export const CHEQ_TELEGRAM = 'https://t.me/cheqd';
export const CHEQ_TWITTER = 'https://twitter.com/cheqd_io';
export const CHEQ_DISCORD = 'http://cheqd.link/discord-github';
export const COSMOS_LEDGER_APP_INSTALL_LINK =
	'https://support.ledger.com/hc/en-us/articles/360013713840-Cosmos-ATOM-?docs=true';
export const KEPLR_INSTALL_LINK = 'https://keplr.app';
export const CHEQ_EXPLORER = IS_TESTNET ? 'https://testnet-explorer.cheqd.io/' : 'https://explorer.cheqd.io';
export const CHEQ_WALLET = IS_TESTNET ? 'https://wallet.testnet.cheqd.network' : 'https://wallet.cheqd.io';
export const CHEQ_COINGECKO_ID = 'cheqd-network';

export const CLIENT_PRECISION = 1_000_000_000_000_000_000;
export const MEDIUM_AIRDROP_ARTICLE = 'https://blog.cheqd.io/cosmos-community-airdrop-32fdb1c0cfd0';
export const KEPLR_DEFAULT_COIN_TYPE = 118;
export const OSMOSIS_API_URL = 'https://api-osmosis.imperator.co';
export const BUY_CHEQ_URL = 'https://app.osmosis.zone/?from=ATOM&to=CHEQ';
