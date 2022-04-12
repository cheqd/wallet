import { SignMode } from '@lum-network/sdk-javascript/build/codec/cosmos/tx/signing/v1beta1/signing';
import { SignDoc } from '@lum-network/sdk-javascript/build/types';
import { Doc } from './types/msg';
import { SignMsg } from './types/signMsg';

export abstract class CheqWallet {
	protected publicKey?: Uint8Array;
	protected address?: string;

	/**
	 * Gets the current wallet address
	 * @see {@link LumWallet.useAccount}
	 *
	 * @returns wallet address (Bech32)
	 */
	getAddress = (): string => {
		if (!this.address) {
			throw new Error('No account selected.');
		}
		return this.address;
	};

	/**
	 * Gets the current wallet public key
	 * @see {@link LumWallet.useAccount}
	 *
	 * @returns wallet public key (secp256k1)
	 */
	getPublicKey = (): Uint8Array => {
		if (!this.publicKey) {
			throw new Error('No account selected.');
		}
		return this.publicKey;
	};

	/**
	 * Gets the wallet signin mode
	 */
	abstract signingMode(): SignMode;

	/**
	 * Whether or not the wallet support changing account
	 * Basically only wallet initialized using a private key should not be able to do so
	 * @see {@link LumWallet.useAccount}
	 */
	abstract canChangeAccount(): boolean;

	/**
	 * Change the wallet to use
	 *
	 * @param hdPath BIP44 HD Path
	 * @param addressPrefix prefix to use (ex: lum)
	 */
	abstract useAccount(hdPath: string, addressPrefix: string): Promise<boolean>;

	/**
	 * Sign a raw payload.
	 * This method might not be available for all types of wallets such as Ledger.
	 *
	 * @param data the payload to sign directly
	 */
	abstract sign(data: Uint8Array): Promise<Uint8Array>;

	/**
	 * Sign a transaction document using a LumWallet
	 *
	 * @param doc document to sign
	 */
	abstract signTransaction(doc: Doc): Promise<[SignDoc, Uint8Array]>;

	/**
	 * Sign a message using a LumWallet
	 * Provided for signature generation and verification as signature will depend on the wallet payload implementation
	 *
	 * @param msg message to sign
	 */
	abstract signMessage(msg: string): Promise<SignMsg>;
}
