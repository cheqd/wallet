// Helpers to authenticate with wallet

import { NanoCheqDenom } from '../network';
import { WalletClient } from './index';
import { Doc } from '../network/types/msg';
import { Wallet } from '../models';
import { KeplrHelper } from 'utils/keplrHelper';
import { KeplrIntereactionOptions } from '@keplr-wallet/types';
import { CheqRegistry } from '../network/modules';
import { LumUtils } from '@lum-network/sdk-javascript';

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

	const memo = 'cheqd wallet connect';
	const accountNumber = 0;
	const sequence = 0;
	const pubKey = wallet.getPublicKey();
	console.log('pubkey: ', pubKey);
	const doc: Doc = {
		chainId,
		fee,
		memo,
		messages: [msg_text_proposal],
		signers: [
			{
				accountNumber,
				sequence,
				publicKey: pubKey,
			},
		],
	};

	const [signDoc, signature] = await wallet.signTransaction(doc);

	if (keplr.isInstalled) {
		// @ts-ignore
		keplr.defaultOptions = optionsBak;
	}

	return LumUtils.generateTxBytes(signDoc, [signature]);
};
