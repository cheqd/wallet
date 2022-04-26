import { SignMode } from '@lum-network/sdk-javascript/build/codec/cosmos/tx/signing/v1beta1/signing';
import { sha256, ripemd160, Ed25519Keypair } from '@cosmjs/crypto';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { Bech32 } from '@cosmjs/encoding';
import {
	isUint8Array,
	generateSignature,
	uint8IndexOf,
	generateSignDoc,
	generateSignDocBytes,
	toAscii,
} from '@lum-network/sdk-javascript/build/utils';
import { getPublicKeyFromPrivateKey, getAddressFromPublicKey, getPrivateKeyFromMnemonic } from '../network/keys';
import { SignDoc } from '@lum-network/sdk-javascript/build/types';
import { CheqWallet } from '../network/wallet';
import {
	CheqBech32PrefixAccAddr,
	CheqMessageSigner,
	CheqWalletSigningVersion,
	getCheqHdPath,
	NanoCheqDenom,
} from '../network/constants';
import { SignMsg } from '../network/types/signMsg';
import { Doc, DocSigner } from '../network/types/msg';
import { GasPrice, SigningStargateClient } from '@cosmjs/stargate';
import { showErrorToast } from 'utils';
import i18n from 'locales';

export class CheqPaperWallet extends CheqWallet {
	private directWallet!: DirectSecp256k1HdWallet;
	private signingStargateClient!: SigningStargateClient;
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
			DirectSecp256k1HdWallet.fromMnemonic(mnemonicOrPrivateKey, { prefix: CheqBech32PrefixAccAddr })
				.then(async (wallet) => {
					this.directWallet = wallet;
					const signingClient = await SigningStargateClient.connectWithSigner(
						process.env.REACT_APP_RPC_URL,
						wallet,
						{ gasPrice: GasPrice.fromString('25' + NanoCheqDenom) },
					);
					this.signingStargateClient = signingClient;
				})
				.catch(() => {
					showErrorToast(i18n.t('wallet.errors.client'));
				});
		}
	}

	signingMode = (): SignMode => {
		return SignMode.SIGN_MODE_DIRECT;
	};

	canChangeAccount = (): boolean => {
		return !!this.mnemonic;
	};

	// eslint-disable-next-line
	useAccount = async (hdPath = getCheqHdPath(0, 0), addressPrefix = CheqBech32PrefixAccAddr): Promise<boolean> => {
		if (this.mnemonic) {
			this.privateKey = await getPrivateKeyFromMnemonic(this.mnemonic);
			this.directWallet = await DirectSecp256k1HdWallet.fromMnemonic(this.mnemonic, {
				prefix: CheqBech32PrefixAccAddr,
			});

			// @ts-ignore
			const [account] = await this.directWallet.getAccounts();
			this.publicKey = account.pubkey;
			this.address = account.address;
			return true;
		} else if (this.privateKey) {
			this.publicKey = await getPublicKeyFromPrivateKey(this.privateKey);
			this.address = getAddressFromPublicKey(this.publicKey, addressPrefix);
			return false;
		}

		throw new Error('No available mnemonic or private key.');
	};

	getAddressFromPublicKey = (publicKey: Uint8Array, prefix = CheqBech32PrefixAccAddr): string => {
		if (publicKey.length !== 33) {
			throw new Error(`Invalid Secp256k1 pubkey length (compressed): ${publicKey.length}`);
		}

		const hash1 = sha256(publicKey);
		const hash2 = ripemd160(hash1);
		return Bech32.encode(prefix, hash2);
	};

	sign = async (data: Uint8Array): Promise<Uint8Array> => {
		if (!this.privateKey || !this.publicKey) {
			throw new Error('sign: No account selected.');
		}

		// this.signingClient().sign
		const signature = await generateSignature(data, this.privateKey);
		return signature;
	};

	signTransaction = async (doc: Doc): Promise<[SignDoc, Uint8Array]> => {
		if (!this.privateKey || !this.publicKey) {
			throw new Error('signTransaction: No account selected.');
		}

		const signerIndex = uint8IndexOf(
			doc.signers.map((signer: DocSigner) => signer.publicKey),
			this.publicKey as Uint8Array,
		);
		if (signerIndex === -1) {
			throw new Error('signTransaction: Signer not found in document');
		}

		const signDoc = generateSignDoc(doc, signerIndex, this.signingMode());
		const signBytes = generateSignDocBytes(signDoc);
		const hashedMessage = sha256(signBytes);
		const signature = await generateSignature(hashedMessage, this.privateKey);

		return [signDoc, signature];
	};

	signMessage = async (msg: string): Promise<SignMsg> => {
		if (!this.privateKey || !this.publicKey) {
			throw new Error('signMessage: No account selected.');
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
