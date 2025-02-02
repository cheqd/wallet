import { OfflineAminoSigner, StdSignDoc as AminoDoc } from '@cosmjs/amino';
import { fromBase64 } from '@cosmjs/encoding';
import { EncodeObject, OfflineDirectSigner, OfflineSigner } from '@cosmjs/proto-signing';
import { StdFee } from '@cosmjs/stargate';
import { LumTypes, LumUtils } from '@lum-network/sdk-javascript';
import { SignMode } from '@lum-network/sdk-javascript/build/codec/cosmos/tx/signing/v1beta1/signing';
import { Message } from '@lum-network/sdk-javascript/build/messages';
import { SignDoc } from '@lum-network/sdk-javascript/build/types';
import { generateSignDoc } from '@lum-network/sdk-javascript/build/utils';
import Long from 'long';
import { CheqMessageSigner, CheqSignOnlyChainId, CheqWalletSigningVersion } from 'network';
import { CheqAminoRegistry } from 'network/modules';
import { Doc, DocSigner, DocV2 } from 'network/types/msg';
import { SignMsg } from 'network/types/signMsg';
import { CheqWallet } from '../network/wallet';

export class CheqOfflineSignerWallet extends CheqWallet {
	private readonly offlineSigner: OfflineSigner;

	/**
	 * Create a LumOfflineSignerWallet instance based on an OfflineSigner instance compatible with Comsjs based
	 * implementations.
	 * This constructor is not intended to be used directly as it does not initialize the underlying key pair
	 * Better use the provided static LumPaperWallet builders
	 *
	 * @param mnemonicOrPrivateKey mnemonic (string) used to derive the private key or private key (Uint8Array)
	 */
	constructor(offlineSigner: OfflineSigner) {
		super();
		this.offlineSigner = offlineSigner;
	}

	signingMode = (): SignMode => {
		if (typeof (this.offlineSigner as OfflineAminoSigner).signAmino === 'function') {
			return SignMode.SIGN_MODE_LEGACY_AMINO_JSON;
		} else if (typeof (this.offlineSigner as OfflineDirectSigner).signDirect === 'function') {
			return SignMode.SIGN_MODE_DIRECT;
		}
		throw 'Unknown offline signer mode';
	};

	canChangeAccount = (): boolean => {
		return false;
	};

	useAccount = async (): Promise<boolean> => {
		const accounts = await this.offlineSigner.getAccounts();
		if (accounts.length === 0) {
			throw new Error('No account available.');
		}

		this.publicKey = accounts[0].pubkey;
		this.address = accounts[0].address;
		return true;
	};

	sign = async (): Promise<Uint8Array> => {
		throw new Error('Feature not supported.');
	};

	signTransaction = async (doc: Doc): Promise<[SignDoc, Uint8Array]> => {
		if (!this.address || !this.publicKey) {
			throw new Error('No account selected.');
		}
		const signerIndex = LumUtils.uint8IndexOf(
			doc.signers.map((signer: DocSigner) => signer.publicKey),
			this.publicKey as Uint8Array,
		);
		if (signerIndex === -1) {
			throw new Error('Signer not found in document');
		}
		if (this.signingMode() === SignMode.SIGN_MODE_DIRECT) {
			const signDoc = generateSignDoc(doc as LumTypes.Doc, signerIndex, this.signingMode());
			const response = await (this.offlineSigner as OfflineDirectSigner).signDirect(this.address, signDoc);
			return [response.signed, LumUtils.fromBase64(response.signature.signature)];
		} else if (this.signingMode() === SignMode.SIGN_MODE_LEGACY_AMINO_JSON) {
			const response = await (this.offlineSigner as OfflineAminoSigner).signAmino(this.address, {
				account_number: doc.signers[signerIndex].accountNumber.toString(),
				chain_id: doc.chainId,
				fee: doc.fee as StdFee,
				memo: doc.memo || '',
				msgs: doc.messages.map((msg: Message) => CheqAminoRegistry.toAmino(msg)),
				sequence: doc.signers[signerIndex].sequence.toString(),
			});
			if (response.signed) {
				// Fees and memo could have been edited by the offline signer
				doc.fee = response.signed.fee;
				doc.memo = response.signed.memo;
			}
			return [
				LumUtils.generateSignDoc(doc as LumTypes.Doc, signerIndex, this.signingMode()),
				LumUtils.fromBase64(response.signature.signature),
			];
		}
		throw 'Unknown offline signer mode';
	};

	signMessage = async (msg: string): Promise<SignMsg> => {
		if (!this.address || !this.publicKey) {
			throw new Error('No account selected.');
		}

		const signDoc = {
			bodyBytes: LumUtils.toAscii(msg),
			authInfoBytes: LumUtils.generateAuthInfoBytes(
				[{ accountNumber: 0, sequence: 0, publicKey: this.getPublicKey() }],
				{ amount: [], gas: '0' },
				this.signingMode(),
			),
			chainId: CheqSignOnlyChainId,
			accountNumber: Long.fromNumber(0),
		};

		if (this.signingMode() === SignMode.SIGN_MODE_DIRECT) {
			const response = await (this.offlineSigner as OfflineDirectSigner).signDirect(this.address, signDoc);
			return {
				address: this.getAddress(),
				publicKey: this.getPublicKey(),
				msg: msg,
				sig: LumUtils.fromBase64(response.signature.signature),
				version: CheqWalletSigningVersion,
				signer: CheqMessageSigner.OFFLINE,
			};
		} else if (typeof (this.offlineSigner as OfflineAminoSigner).signAmino === 'function') {
			throw 'Feature not available for amino signers';
		}

		throw 'Unknown offline signer mode';
	};

	signAminoTx = async (doc: DocV2): Promise<[AminoDoc, Uint8Array]> => {
		const signerIndex = LumUtils.uint8IndexOf(
			doc.signers.map((signer: DocSigner) => signer.publicKey),
			this.publicKey as Uint8Array,
		);

		if (signerIndex === -1) {
			throw new Error('Signer not found in document');
		}

		const aminoDoc: AminoDoc = {
			account_number: doc.signers[signerIndex].accountNumber.toString(),
			chain_id: doc.chainId,
			fee: doc.fee as StdFee,
			memo: doc.memo || '',
			msgs: doc.messages.map((msg: EncodeObject) => CheqAminoRegistry.toAmino(msg)),
			sequence: doc.signers[signerIndex].sequence.toString(),
		}

		const { signed, signature } = await (this.offlineSigner as OfflineAminoSigner).signAmino(this.address!, aminoDoc);
		return [signed, fromBase64(signature.signature)];
	}
}
