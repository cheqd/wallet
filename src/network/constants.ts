/**
 * CHEQ Exponent
 * 1 CHEQ = 10^9 ncheq
 */
export const CheqExponent = 9;

/**
 * Cheq Coin denomination
 */
export const CheqDenom = 'cheq';

/**
 * Nano Cheq Coin denomination
 */
export const NanoCheqDenom = 'ncheq';

/**
 * Cheq Network Bech32 prefix of an account's address
 */
export const CheqBech32PrefixAccAddr = 'cheqd';

/**
 * Cheq Network Bech32 prefix of an account's public key
 */
export const CheqBech32PrefixAccPub = 'cheqdpub';

/**
 * Cheq Network Bech32 prefix of a validator's operator address
 */
export const CheqBech32PrefixValAddr = 'cheqdvaloper';

/**
 * Cheq Network Bech32 prefix of a validator's operator public key
 */
export const CheqBech32PrefixValPub = 'cheqdvaloperpub';

/**
 * Cheq Network Bech32 prefix of a consensus node address
 */
export const CheqBech32PrefixConsAddr = 'cheqdvalcons';

/**
 * Cheq Network Bech32 prefix of a consensus node public key
 */
export const CheqBech32PrefixConsPub = 'cheqdvalconspub';

/**
 * Cheq Network HDPath
 *
 * @see https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
 * @see https://github.com/satoshilabs/slips/blob/master/slip-0044.md
 */
export const HDPath = "m/44'/118'/0'/";

/**
 * Get a Cheq Network HDPath for a specified account index
 *
 * @param accountIndex appended at the end of the default Cheq derivation path
 */
export const getCheqHdPath = (accountIndex = 0, walletIndex = 0): string => {
	return HDPath + accountIndex.toString() + '/' + walletIndex.toString();
};

/**
 * Private Key length
 */
export const PrivateKeyLength = 32;

/**
 * Signing version of the SDK
 */
export const CheqWalletSigningVersion = '1';

/**
 * Signing wallets
 */
export enum CheqMessageSigner {
	PAPER = 'cheqd-sdk/paper',
	LEDGER = 'cheqd-sdk/ledger',
	OFFLINE = 'cheqd-sdk/offline',
}

/**
 * Chain ID used for message signature by wallet implementations that require one
 */
export const CheqSignOnlyChainId = 'cheqd-signature-only';
