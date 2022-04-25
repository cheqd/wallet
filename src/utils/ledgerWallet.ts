import Transport from '@ledgerhq/hw-transport';
import Cosmos from '@ledgerhq/hw-app-cosmos';
import { ExtendedSecp256k1Signature } from '@cosmjs/crypto';

import { SignMode } from '@lum-network/sdk-javascript/build/codec/cosmos/tx/signing/v1beta1/signing';
import {
	isUint8Array,
	generateSignDoc,
	sortJSON,
	uint8IndexOf,
	fromHex,
} from '@lum-network/sdk-javascript/build/utils';

import { CheqAminoRegistry } from '../network/modules/registry';
import { CheqMessageSigner, CheqSignOnlyChainId, CheqWalletSigningVersion } from '../network/constants';
import { CheqWallet } from 'network/wallet';
import { SignMsg } from 'network/types/signMsg';
import { Doc } from 'network/types/msg';
import { SignDoc } from '@lum-network/sdk-javascript/build/types';
import { LumTypes } from '@lum-network/sdk-javascript';

export class CheqLedgerWallet extends CheqWallet {
	cosmosApp: Cosmos;
	private hdPath?: string;

	constructor(transport: Transport, scrambleKey = 'CSM') {
		super();
		this.cosmosApp = new Cosmos(transport, scrambleKey);
	}

	signingMode = (): SignMode => {
		return SignMode.SIGN_MODE_LEGACY_AMINO_JSON;
	};

	canChangeAccount = () => {
		return true;
	};

	/**
	 * Gets the connected application configuration
	 */
	getAppConfiguration = async (): Promise<{
		test_mode: boolean;
		version: string;
		device_locked: boolean;
		major: number;
	}> => {
		return this.cosmosApp.getAppConfiguration();
	};

	useAccount = async (hdPath: string, addressPrefix: string): Promise<boolean> => {
		const { address, publicKey } = await this.cosmosApp.getAddress(hdPath, addressPrefix);
		this.hdPath = hdPath;
		this.address = address;
		this.publicKey = fromHex(publicKey);
		return true;
	};

	sign = async (): Promise<Uint8Array> => {
		throw new Error('Feature not supported.');
	};

	signTransaction = async (doc: Doc): Promise<[SignDoc, Uint8Array]> => {
		if (!this.hdPath) {
			throw new Error('No account selected.');
		}
		// Implementation only works using Legacy Amino payload.
		//
		// Useful doc & code:
		// sign call: https://github.com/LedgerHQ/ledgerjs/blob/master/packages/hw-app-cosmos/src/Cosmos.js
		// Expected tx format: https://github.com/cosmos/ledger-cosmos/blob/master/docs/TXSPEC.md
		const signerIndex = uint8IndexOf(
			doc.signers.map((signer: any) => signer.publicKey),
			this.publicKey as Uint8Array,
		);
		if (signerIndex === -1) {
			throw new Error('Signer not found in document');
		}
		const msg = {
			account_number: doc.signers[signerIndex].accountNumber.toString(),
			chain_id: doc.chainId,
			fee: doc.fee,
			memo: doc.memo,
			msgs: doc.messages.map((msg: any) => CheqAminoRegistry.toAmino(msg)),
			sequence: doc.signers[signerIndex].sequence.toString(),
		};
		const { signature, return_code } = await this.cosmosApp.sign(this.hdPath, JSON.stringify(sortJSON(msg)));
		if (!signature || return_code === 0) {
			throw new Error(`Failed to sign message: error code ${return_code}`);
		}
		const sig = ExtendedSecp256k1Signature.fromDer(signature);
		return [generateSignDoc(doc, signerIndex, this.signingMode()), new Uint8Array([...sig.r(32), ...sig.s(32)])];
	};

	signMessage = async (msg: string): Promise<SignMsg> => {
		if (!this.hdPath) {
			throw new Error('No account selected.');
		}
		// Implementation only works using Legacy Amino payload.
		// We must simulate an empty transaction to get a valid signature from the device
		//
		// The transaction will not work if broadcasted anyway. This is intented to avoid wrong usage of this feature
		// that is only provided for basic message signature and verification
		const msgToSign = {
			account_number: '0',
			chain_id: CheqSignOnlyChainId,
			fee: {},
			memo: msg,
			msgs: [],
			sequence: '0',
		};
		const { signature, return_code } = await this.cosmosApp.sign(this.hdPath, JSON.stringify(sortJSON(msgToSign)));
		if (!signature || return_code === 0) {
			throw new Error(`Failed to sign message: error code ${return_code}`);
		}
		const sig = ExtendedSecp256k1Signature.fromDer(signature);

		return {
			address: this.getAddress(),
			publicKey: this.getPublicKey(),
			msg: msg,
			sig: new Uint8Array([...sig.r(32), ...sig.s(32)]),
			version: CheqWalletSigningVersion,
			signer: CheqMessageSigner.LEDGER,
		};
	};
}
