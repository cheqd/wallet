// Helpers to authenticate with wallet

import { NanoCheqDenom } from '../network';
import { WalletClient } from './index';
import { Doc } from '../network/types/msg';
import { LumAminoRegistry, LumRegistry, LumUtils } from '@lum-network/sdk-javascript';
import { Wallet } from '../models';
import { KeplrHelper } from 'utils/keplrHelper';
import { KeplrIntereactionOptions } from '@keplr-wallet/types';
import { CheqRegistry } from '../network/modules';

import { fromBase64, generateSignDocBytes, toBase64 } from '@lum-network/sdk-javascript/build/utils';
import { longify } from '@lum-network/sdk-javascript/build/extensions/utils';
import { decodeTxRaw, Registry, decodePubkey } from '@cosmjs/proto-signing';
import Long from 'long';
import { SignMode } from '@lum-network/sdk-javascript/build/codec/cosmos/tx/signing/v1beta1/signing';
import { serializeSignDoc } from '@cosmjs/amino';

// Builds submit text proposal transaction with specific title and description
export const getAuthToken = async (wallet: Wallet, uri: string): Promise<Uint8Array> => {
	const title = 'AuthRequest';
	const description = JSON.stringify({
		uri,
		time: new Date(),
	});

	const msg_text_proposal = {
		typeUrl: '/cosmos.gov.v1beta1.TextProposal',
		value: {
			title,
			description,
		},
	};

	const msg = {
		typeUrl: '/cosmos.gov.v1beta1.MsgSubmitProposal',
		value: {
			content: {
				typeUrl: msg_text_proposal.typeUrl,
				value: CheqRegistry.encode(msg_text_proposal),
			},
			proposer: '',
			initialDeposit: [],
		},
	};

	const fee = {
		amount: [{ denom: NanoCheqDenom, amount: '0' }],
		gas: '1', // Keplr requires positive number
	};

	const memo = '';
	const chainId = WalletClient.chainId || '';

	const accountNumber = 0;
	const sequence = 0;

	const doc: Doc = {
		chainId,
		fee,
		memo,
		messages: [msg],
		signers: [
			{
				accountNumber,
				sequence,
				publicKey: wallet.getPublicKey(),
			},
		],
	};

	const keplr = new KeplrHelper();
	let optionsBak: KeplrIntereactionOptions;

	if (keplr.isInstalled) {
		optionsBak = keplr.defaultOptions;
		keplr.defaultOptions = {
			sign: {
				preferNoSetFee: true,
				preferNoSetMemo: true,
			},
		};
	}

	console.log('Doc is: ', JSON.stringify(doc));

	const [signDoc, signature] = await wallet.signTransaction(doc);

	if (keplr.isInstalled) {
		// @ts-ignore
		keplr.defaultOptions = optionsBak;
	}

	// const isValid = await LumUtils.verifySignature(signature, generateSignDocBytes(signDoc), wallet.getPublicKey());
	const isValid = await backend_functionality(LumUtils.generateTxBytes(signDoc, [signature]));
	console.log('Signature: ', signature);
	console.log(signDoc);
	console.log(toBase64(generateSignDocBytes(signDoc)));
	console.log(toBase64(LumUtils.generateTxBytes(signDoc, [signature])));
	console.log('PublicKey: ', wallet.getPublicKey());
	console.log('is signature valid: ', isValid);

	return LumUtils.generateTxBytes(signDoc, [signature]);
};

const backend_functionality = async (token: Uint8Array): Promise<boolean> => {
	const chainId = 'cheqd-testnet-4';
	const decoded = decodeTxRaw(token);
	const pubkey = decodePubkey(decoded.authInfo.signerInfos[0].publicKey);
	const signature = decoded.signatures[0];
	const signMode = decoded.authInfo.signerInfos[0].modeInfo?.single?.mode;
	console.log('Decoded message: ', decoded);
	if (decoded.authInfo.fee == undefined) {
		return false;
	}
	if (pubkey == null) {
		return false;
	}
	if (signMode == undefined) {
		return false;
	}

	const raw_pubkey = fromBase64(pubkey.value);

	const docSigner = {
		accountNumber: 0,
		sequence: 0,
		publicKey: raw_pubkey,
	};
	const _gas = new Long(
		decoded.authInfo.fee.gasLimit.low,
		decoded.authInfo.fee.gasLimit.high,
		decoded.authInfo.fee.gasLimit.unsigned,
	);
	const fee = {
		amount: decoded.authInfo.fee.amount,
		gas: _gas.toString(),
	};

	const message = LumRegistry.decode(decoded.body.messages[0]);
	const doc = {
		chainId: chainId,
		fee: fee,
		memo: decoded.body.memo,
		messages: [
			{
				typeUrl: decoded.body.messages[0].typeUrl,
				value: message,
			},
		],
		signers: [docSigner],
	};
	let ok = false;
	if (signMode == SignMode.SIGN_MODE_DIRECT) {
		const signDoc = LumUtils.generateSignDoc(doc, 0, signMode);
		const sortedJSON = {
			accountNumber: signDoc.accountNumber,
			authInfoBytes: signDoc.authInfoBytes,
			bodyBytes: signDoc.bodyBytes,
			chainId: signDoc.chainId,
		};
		const signed_bytes = LumUtils.generateSignDocBytes(sortedJSON);
		ok = await LumUtils.verifySignature(signature, signed_bytes, raw_pubkey);
	} else if (signMode == SignMode.SIGN_MODE_LEGACY_AMINO_JSON) {
		const amino_doc_bytes = serializeSignDoc({
			account_number: doc.signers[0].accountNumber.toString(),
			chain_id: doc.chainId,
			fee: doc.fee,
			memo: doc.memo || '',
			msgs: doc.messages.map((msg: any) => LumAminoRegistry.toAmino(msg)),
			sequence: doc.signers[0].sequence.toString(),
		});
		ok = await LumUtils.verifySignature(signature, amino_doc_bytes, raw_pubkey);
	}

	return ok;
};
