import { SignMode } from '@lum-network/sdk-javascript/build/codec/cosmos/tx/signing/v1beta1/signing';
import {
	isUint8Array,
	getPrivateKeyFromMnemonic,
	getPublicKeyFromPrivateKey,
	getAddressFromPublicKey,
	generateSignature,
	uint8IndexOf,
	generateSignDoc,
	generateSignDocBytes,
	sha256,
	toAscii,
} from '@lum-network/sdk-javascript/build/utils';
import { SignDoc } from '@lum-network/sdk-javascript/build/types';
import { CheqWallet } from '../network/wallet';
import {
	CheqBech32PrefixAccAddr,
	CheqMessageSigner,
	CheqWalletSigningVersion,
	getCheqHdPath,
} from '../network/constants';
import { SignMsg } from '../network/types/signMsg';
import { Doc } from '../network/types/msg';

export class CheqPaperWallet extends CheqWallet {
	private readonly mnemonic?: string;
	private privateKey?: Uint8Array;

	/**
	 * Create a CheqPaperWallet instance based on a mnemonic or a private key
	 * This constructor is not intended to be used directly as it does not initialize the underlying key pair
	 * Better use the provided static CheqPaperWallet builders
	 *
	 * @param mnemonicOrPrivateKey mnemonic (string) used to derive the private key or private key (Uint8Array)
	 */
	constructor(mnemonicOrPrivateKey: string | Uint8Array) {
		super();
		if (isUint8Array(mnemonicOrPrivateKey)) {
			// @ts-ignore
			this.privateKey = mnemonicOrPrivateKey;
		} else {
			// @ts-ignore
			this.mnemonic = mnemonicOrPrivateKey;
		}
	}

	signingMode = (): SignMode => {
		return SignMode.SIGN_MODE_DIRECT;
	};

	canChangeAccount = (): boolean => {
		return !!this.mnemonic;
	};

	useAccount = async (hdPath = getCheqHdPath(0, 0), addressPrefix = CheqBech32PrefixAccAddr): Promise<boolean> => {
		if (this.mnemonic) {
			this.privateKey = await getPrivateKeyFromMnemonic(this.mnemonic, hdPath);
			this.publicKey = await getPublicKeyFromPrivateKey(this.privateKey);
			this.address = getAddressFromPublicKey(this.publicKey, addressPrefix);
			return true;
		} else if (this.privateKey) {
			this.publicKey = await getPublicKeyFromPrivateKey(this.privateKey);
			this.address = getAddressFromPublicKey(this.publicKey, addressPrefix);
			return false;
		}
		throw new Error('No available mnemonic or private key.');
	};

	sign = async (data: Uint8Array): Promise<Uint8Array> => {
		if (!this.privateKey || !this.publicKey) {
			throw new Error('No account selected.');
		}
		const signature = await generateSignature(data, this.privateKey);
		return signature;
	};

	signTransaction = async (doc: Doc): Promise<[SignDoc, Uint8Array]> => {
		if (!this.privateKey || !this.publicKey) {
			throw new Error('No account selected.');
		}
		const signerIndex = uint8IndexOf(
			doc.signers.map((signer: any) => signer.publicKey),
			this.publicKey as Uint8Array,
		);
		if (signerIndex === -1) {
			throw new Error('Signer not found in document');
		}
		const signDoc = generateSignDoc(doc, signerIndex, this.signingMode());
		const signBytes = generateSignDocBytes(signDoc);
		const hashedMessage = sha256(signBytes);
		const signature = await generateSignature(hashedMessage, this.privateKey);
		return [signDoc, signature];
	};

	signMessage = async (msg: string): Promise<SignMsg> => {
		if (!this.privateKey || !this.publicKey) {
			throw new Error('No account selected.');
		}
		const signature = await generateSignature(sha256(toAscii(msg)), this.privateKey);
		return {
			address: this.getAddress(),
			publicKey: this.getPublicKey(),
			msg: msg,
			sig: signature,
			version: CheqWalletSigningVersion,
			signer: CheqMessageSigner.PAPER,
		};
	};
}
