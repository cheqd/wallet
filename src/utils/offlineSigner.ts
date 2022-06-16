import Long from 'long';
import { OfflineAminoSigner } from '@cosmjs/amino';
import { OfflineSigner, OfflineDirectSigner, EncodeObject, makeSignDoc, makeSignBytes, makeAuthInfoBytes, Registry } from '@cosmjs/proto-signing';
import { LumTypes, LumUtils } from '@lum-network/sdk-javascript';
import { CheqWallet } from '../network/wallet';
import { CheqMessageSigner, CheqSignOnlyChainId, CheqWalletSigningVersion } from 'network';
import { CheqAminoRegistry, CheqRegistry, registryTypes } from 'network/modules';
import { SignMsg } from 'network/types/signMsg';
import { Doc, DocSigner } from 'network/types/msg';
import { defaultRegistryTypes, StdFee } from '@cosmjs/stargate';
import { fromBase64, toAscii } from '@cosmjs/encoding';
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing';
import { AuthInfo, Fee, SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { publicKeyToProto } from 'network/keys';
import { Int53 } from '@cosmjs/math';
import { TextProposal } from 'cosmjs-types/cosmos/gov/v1beta1/gov';

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
		// const signerIndex = LumUtils.uint8IndexOf(
		// 	doc.signers.map((signer: DocSigner) => signer.publicKey),
		// 	this.publicKey as Uint8Array,
		// );

		// if (signerIndex === -1) {
		// 	throw new Error('Signer not found in document');
		// }
		//
		// makeAuthInfoBytes()
		// makeSignDoc(doc.messages,)

		const signDoc = this.generateSignDoc(doc, SignMode.SIGN_MODE_LEGACY_AMINO_JSON);
		console.log('signdoc: ', signDoc);

		const response = await (this.offlineSigner as OfflineDirectSigner).signDirect(this.address, signDoc);
		return [response.signed, fromBase64(response.signature.signature)]
		// 		if (this.signingMode() === SignMode.SIGN_MODE_DIRECT) {
		// 			const signDoc = generateSignDoc(doc as LumTypes.Doc, signerIndex, this.signingMode());
		// 			const response = await (this.offlineSigner as OfflineDirectSigner).signDirect(this.address, signDoc);
		// 			return [response.signed, LumUtils.fromBase64(response.signature.signature)];
		// 		} else if (this.signingMode() === SignMode.SIGN_MODE_LEGACY_AMINO_JSON) {
		// 			const response = await (this.offlineSigner as OfflineAminoSigner).signAmino(this.address, {
		// 				account_number: doc.signers[signerIndex].accountNumber.toString(),
		// 				chain_id: doc.chainId,
		// 				fee: doc.fee as StdFee,
		// 				memo: doc.memo || '',
		// 				msgs: doc.messages.map((msg: Message) => CheqAminoRegistry.toAmino(msg)),
		// 				sequence: doc.signers[signerIndex].sequence.toString(),
		// 			});
		// 			if (response.signed) {
		// 				// Fees and memo could have been edited by the offline signer
		// 				doc.fee = response.signed.fee;
		// 				doc.memo = response.signed.memo;
		// 			}
		// 			return [
		// 				LumUtils.generateSignDoc(doc as LumTypes.Doc, signerIndex, this.signingMode()),
		// 				LumUtils.fromBase64(response.signature.signature),
		// 			];
		// 		}
		throw 'Unknown offline signer mode';
	};

	generateSignDoc = (doc: Doc, signMode: SignMode): SignDoc => {
		// const txBody = {
		// 	messages: doc.messages,
		// 	memo: doc.memo,
		// };

		const reg = new Registry(registryTypes);
		reg.register('/cosmos.gov.v1beta1.TextProposal', TextProposal)
		console.log('doc.messages: ', doc.messages);

		const bodyBytes = reg.encode(doc.messages[0]);

		console.log('bodybytes: ', bodyBytes)

		const signers = doc.signers.map(o => {
			return {
				sequence: o.sequence,
				pubkey: publicKeyToProto(o.publicKey),
			}
		})

		const authinfobz = makeAuthInfoBytes(signers, doc.fee.amount, signMode)
		console.log('authInfo: ', authinfobz);

		return {
			bodyBytes,
			authInfoBytes: authinfobz,
			chainId: doc.chainId,
			accountNumber: Long.fromNumber(doc.signers[0].accountNumber),
		};
	};

	generateAuthInfoBytes = (docSigners: DocSigner[], fee: Fee, signMode: SignMode): Uint8Array => {
		const authInfo = {
			signerInfos: docSigners.map((signer: DocSigner) => ({
				publicKey: publicKeyToProto(signer.publicKey),
				modeInfo: {
					single: { mode: signMode },
				},
				sequence: Long.fromNumber(signer.sequence),
			})),
			fee: {
				amount: [...fee.amount],
				gasLimit: fee.gasLimit.toNumber(),
			},
		};

		return AuthInfo.encode(AuthInfo.fromPartial(authInfo)).finish();
	};

	signMessage = async (msg: string): Promise<SignMsg> => {
		if (!this.address || !this.publicKey) {
			throw new Error('No account selected.');
		}

		const signDoc = {
			bodyBytes: toAscii(msg),
			authInfoBytes: this.generateAuthInfoBytes(
				[{ accountNumber: 0, sequence: 0, publicKey: this.getPublicKey() }],
				{ amount: [], gasLimit: Long.fromNumber(80000), payer: this.getAddress(), granter: this.getAddress() },
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
}
