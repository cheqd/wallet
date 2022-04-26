// Helpers to authenticate with wallet

import { NanoCheqDenom } from '../network';
import { WalletClient, WalletUtils } from './index';
import { Doc } from '../network/types/msg';
import { LumAminoRegistry, LumRegistry, LumUtils } from '@lum-network/sdk-javascript';
import { Wallet } from '../models';
import { KeplrHelper } from 'utils/keplrHelper';
import { KeplrIntereactionOptions } from '@keplr-wallet/types';
import { CheqRegistry } from '../network/modules';

import { fromBase64, generateSignDocBytes, toBase64 } from '@lum-network/sdk-javascript/build/utils';
import { longify } from '@lum-network/sdk-javascript/build/extensions/utils';
import { decodeTxRaw, Registry, decodePubkey, makeSignDoc } from '@cosmjs/proto-signing';
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

	const chainId = await WalletClient.cheqClient.getChainId();

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
	const fee = {
		amount: [{ denom: NanoCheqDenom, amount: '0' }],
		gas: '1', // Keplr requires positive number
	};

	const memo = '';

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

	// if (WalletClient.cheqClient) {
	// 	const bz = await WalletClient.cheqClient.signTxWithStargateSigningClient(wallet, [msg]);
	// 	return bz;
	// }

	const [signDoc, signature] = await wallet.signTransaction(doc);

	if (keplr.isInstalled) {
		// @ts-ignore
		keplr.defaultOptions = optionsBak;
	}

	return LumUtils.generateTxBytes(signDoc, [signature]);
};
