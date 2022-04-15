// Helpers to authenticate with wallet

import { NanoCheqDenom } from '../network';
import { WalletClient } from './index';
import { Doc } from '../network/types/msg';
import { LumUtils } from '@lum-network/sdk-javascript';
import { Wallet } from '../models';

// Builds submit text proposal transaction with specific title and description
export const buildAuthTx = async (wallet: Wallet, uri: string): Promise<Uint8Array> => {
	const title = 'AuthRequest';
	const description = JSON.stringify({
		uri,
		time: new Date(),
	});

	const msg = {
		typeUrl: '/cosmos.gov.v1beta1.MsgSubmitProposal',
		value: {
			content: {
				typeUrl: '/cosmos.gov.v1beta1.TextProposal',
				value: {
					title,
					description,
				},
			},
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

	const [signDoc, signature] = await wallet.signTransaction(doc);
	return LumUtils.generateTxBytes(signDoc, [signature]);
};
