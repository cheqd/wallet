// Helpers to authenticate with wallet

import { StdSignDoc } from '@cosmjs/amino';
import { encodeSecp256k1Pubkey } from '@cosmjs/launchpad';
import { Int53 } from '@cosmjs/math';
import { decodePubkey, encodePubkey, makeAuthInfoBytes, TxBodyEncodeObject } from '@cosmjs/proto-signing';
import { MsgSubmitProposalEncodeObject } from '@cosmjs/stargate';
import { KeplrIntereactionOptions } from '@keplr-wallet/types';
import { TextProposal } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { KeplrHelper } from 'utils/keplrHelper';
import { Wallet } from '../models';
import { NanoCheqDenom } from '../network';
import { CheqAminoRegistry, CheqRegistry } from '../network/modules';
import { DocV2 } from '../network/types/msg';
import { WalletClient } from './index';

// Builds submit text proposal transaction with specific title and description
export const getAuthToken = async (wallet: Wallet, uri: string): Promise<Uint8Array> => {
	const title = 'AuthRequest';
	// use UTC time to remove any confusion about using timezone offsets
	const description = JSON.stringify({ uri, time: new Date().toUTCString() });

	const textProposal = TextProposal.fromPartial({ title, description });
	const msg: MsgSubmitProposalEncodeObject = {
		typeUrl: "/cosmos.gov.v1beta1.MsgSubmitProposal",
		value: {
			content: {
				typeUrl: "/cosmos.gov.v1beta1.TextProposal",
				value: TextProposal.encode(textProposal).finish(),
			},
			proposer: wallet.getAddress(),
			initialDeposit: [],
		}
	}

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

	const doc: DocV2 = {
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

	const [signDoc, signature] = await wallet.signAminoTx(doc);
	if (keplr.isInstalled) {
		// @ts-ignore
		keplr.defaultOptions = optionsBak;
	}

	return buildAminoTxBody(signDoc, wallet.getPublicKey(), signature)
};


function buildAminoTxBody(signed: StdSignDoc, publicKey: Uint8Array, signature: Uint8Array): Uint8Array {
	const msgs = signed.msgs.map(msg => {
		return CheqAminoRegistry.fromAmino(msg)
	})

	const signedTxBody: TxBodyEncodeObject = {
		typeUrl: "/cosmos.tx.v1beta1.TxBody",
		value: {
			messages: msgs,
			memo: signed.memo,
		},
	};

	const pubkey = encodePubkey(encodeSecp256k1Pubkey(publicKey));
	const signedTxBodyBytes = CheqRegistry.encode(signedTxBody);
	const signedGasLimit = Int53.fromString(signed.fee.gas).toNumber();
	const signedSequence = Int53.fromString(signed.sequence).toNumber();
	const signedAuthInfoBytes = makeAuthInfoBytes(
		[{ pubkey, sequence: signedSequence }],
		signed.fee.amount,
		signedGasLimit,
		SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
	);

	const txRaw = TxRaw.fromPartial({
		bodyBytes: signedTxBodyBytes,
		authInfoBytes: signedAuthInfoBytes,
		signatures: [signature],
	});

	const rawTxBytes = TxRaw.encode(txRaw).finish()
	return rawTxBytes;
}
