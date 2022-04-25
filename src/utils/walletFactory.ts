import Transport from '@ledgerhq/hw-transport';
import { OfflineSigner } from '@cosmjs/proto-signing';

import { CheqWallet } from '../network/wallet';
// import { CheqLedgerWallet } from './LumLedgerWallet';
import { CheqPaperWallet } from './paperWallet';
// import { CheqOfflineSignerWallet } from './LumOfflineSignerWallet';
import { getCheqHdPath, CheqBech32PrefixAccAddr } from '../network/constants';
import { LumUtils } from '@lum-network/sdk-javascript';
import { CheqLedgerWallet } from './ledgerWallet';
import { CheqOfflineSignerWallet } from './offlineSigner';

export class CheqWalletFactory {
	/**
	 * Create a CheqWallet instance based on a private key (secp256k1)
	 *
	 * @param privateKey wallet private key (secp256k1)
	 * @param addressPrefix prefix to use to derive the address from the public key (ex: cheqd)
	 */
	static fromPrivateKey = async (
		privateKey: Uint8Array,
		addressPrefix = CheqBech32PrefixAccAddr,
	): Promise<CheqWallet> => {
		const wallet = new CheqPaperWallet(privateKey);
		await wallet.useAccount(getCheqHdPath(0, 0), addressPrefix);
		return wallet;
	};

	/**
	 * Create a CheqWallet instance based on a mnemonic and a derivation path
	 *
	 * @param mnemonic mnemonic used to derive the private key
	 * @param hdPath BIP44 derivation path
	 * @param addressPrefix prefix to use to derive the address from the public key (ex: cheqd)
	 */
	static fromMnemonic = async (
		mnemonic: string,
		hdPath = getCheqHdPath(0, 0),
		addressPrefix = CheqBech32PrefixAccAddr,
	): Promise<CheqWallet> => {
		const wallet = new CheqPaperWallet(mnemonic);
		await wallet.useAccount(hdPath, addressPrefix);
		return wallet;
	};

	/**
	 * Create a CheqWallet instance based on a keystore
	 *
	 * @param keystore keystore used to decypher the private key
	 * @param password keystore password
	 * @param addressPrefix prefix to use to derive the address from the public key (ex: cheqd)
	 */
	static fromKeyStore = async (
		keystore: string | LumUtils.KeyStore,
		password: string,
		addressPrefix = CheqBech32PrefixAccAddr,
	): Promise<CheqWallet> => {
		const privateKey = LumUtils.getPrivateKeyFromKeystore(keystore, password);
		const wallet = new CheqPaperWallet(privateKey);
		await wallet.useAccount(getCheqHdPath(0, 0), addressPrefix);
		return wallet;
	};

	/**
	 * Create a CheqWallet instance based on an OfflineDirectSigner instance compatible with Comsjs based implementations.
	 *
	 * @param offlineSigner OfflineDirectSigner instance compatible with Comsjs based implementations
	 */
	static fromOfflineSigner = async (offlineSigner: OfflineSigner): Promise<CheqWallet> => {
		const wallet = new CheqOfflineSignerWallet(offlineSigner);
		await wallet.useAccount();
		return wallet;
	};

	/**
	 * Create a CheqWallet instance based on a ledger transport
	 *
	 * @param transport Ledger transport to use (https://github.com/LedgerHQ/ledgerjs)
	 * @param hdPath BIP44 derivation path
	 * @param addressPrefix prefix to use to derive the address from the public key (ex: cheqd)
	 */
	static fromLedgerTransport = async (
		transport: Transport,
		hdPath = getCheqHdPath(0, 0),
		addressPrefix = CheqBech32PrefixAccAddr,
	): Promise<CheqWallet> => {
		const wallet = new CheqLedgerWallet(transport);
		await wallet.useAccount(hdPath, addressPrefix);
		return wallet;
	};
}
