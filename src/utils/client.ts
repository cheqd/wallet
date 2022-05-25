import axios from 'axios';
import { TxResponse } from '@cosmjs/tendermint-rpc';
import { Secp256k1, Secp256k1Signature } from '@cosmjs/crypto';
import { assertIsDeliverTxSuccess, SigningStargateClient, coin, GasPrice } from '@cosmjs/stargate';
import { LumUtils } from '@lum-network/sdk-javascript';
import { ProposalStatus, VoteOption } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { OSMOSIS_API_URL } from 'constant';
import Long from 'long';
import { CheqInfo, PasswordStrength, PasswordStrengthType, Proposal, Transaction, Wallet } from 'models';
import { CheqClient } from 'network/cheqd';
import { CheqRegistry } from 'network/modules/registry';
import { SignMsg } from 'network/types/signMsg';
import { CheqDenom, CheqMessageSigner, CheqSignOnlyChainId, NanoCheqDenom } from 'network/constants';
import { sortByBlockHeight } from './transactions';
import {
	Bech32,
	generateAuthInfoBytes,
	getAddressFromPublicKey,
	sha256,
	sortJSON,
	toAscii,
} from '@lum-network/sdk-javascript/build/utils';
import { DirectSecp256k1HdWallet, makeSignBytes } from '@cosmjs/proto-signing';
import { convertCoin } from 'network/util';
import { MsgBeginRedelegate, MsgDelegate, MsgUndelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx';
import {
	MsgBeginRedelegateUrl,
	MsgDelegateUrl,
	MsgSendUrl,
	MsgUndelegateUrl,
	MsgVoteUrl,
	MsgWithdrawDelegatorRewardUrl,
} from '@lum-network/sdk-javascript/build/messages';
import { MsgWithdrawDelegatorReward } from 'cosmjs-types/cosmos/distribution/v1beta1/tx';
import { MsgVote } from 'cosmjs-types/cosmos/gov/v1beta1/tx';
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';
import { estimatedVesting } from 'utils';
import { SignMode } from '@lum-network/sdk-javascript/build/codec/cosmos/tx/signing/v1beta1/signing';

export type MnemonicLength = 12 | 24;

export const checkMnemonicLength = (length: number): length is MnemonicLength => {
	return length === 12 || length === 24;
};

export const generateMnemonic = (mnemonicLength: MnemonicLength): string[] => {
	const inputs: string[] = [];
	const mnemonicKeys = LumUtils.generateMnemonic(mnemonicLength).split(' ');

	for (let i = 0; i < mnemonicLength; i++) {
		inputs.push(mnemonicKeys[i]);
	}

	return inputs;
};

export const generateKeystoreFile = (password: string): LumUtils.KeyStore => {
	const privateKey = LumUtils.generatePrivateKey();

	return LumUtils.generateKeyStore(privateKey, password);
};

export const checkPwdStrength = (password: string): PasswordStrength => {
	const strongPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{9,})');
	const mediumPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{9,})');

	if (strongPassword.test(password)) {
		return PasswordStrengthType.Strong;
	} else if (mediumPassword.test(password)) {
		return PasswordStrengthType.Medium;
	}
	return PasswordStrengthType.Weak;
};

type SendTxInfos = {
	fromAddress: string;
	toAddress: string;
	amount: Coin[];
};

type StakingTxInfos = {
	validatorAddress: string;
	delegatorAddress: string;
	amount: Coin;
};

type CheqInfoType = {
	price: number;
	denom: string;
	symbol: string;
	liquidity: number;
	volume_24h: number;
	name: number;
};

type PreviousDayCheqInfoType = {
	open: number;
	high: number;
	close: number;
	low: number;
	time: number;
};

const isSendTxInfo = (
	info: {
		fromAddress?: string;
		toAddress?: string;
		amount?: Coin[];
	} | null,
): info is SendTxInfos => {
	return !!(info && info.fromAddress && info.toAddress && info.amount);
};

const isStakingTxInfo = (
	info: {
		delegatorAddress?: string;
		validatorAddress?: string;
		amount?: Coin;
	} | null,
): info is StakingTxInfos => {
	return !!(info && info.validatorAddress && info.delegatorAddress && info.amount);
};

const isCheqInfo = (
	info: {
		price?: number;
		denom?: string;
		symbol?: string;
		liquidity?: number;
		volume_24h?: number;
		name?: number;
	} | null,
): info is CheqInfoType => {
	return !!(info && info.price && info.liquidity && info.denom && info.name && info.volume_24h);
};

const isPreviousDayCheqInfo = (
	info: {
		open?: number;
		high?: number;
		close?: number;
		low?: number;
		time?: number;
	} | null,
): info is PreviousDayCheqInfoType => {
	return !!(info && info.open && info.close && info.high && info.low && info.time);
};

const alreadyExists = (array: Transaction[], value: Transaction) => {
	return array.length === 0 ? false : array.findIndex((val) => val.hash === value.hash) > -1;
};

export const formatTxs = async (rawTxs: TxResponse[]): Promise<Transaction[]> => {
	const formattedTxs: Transaction[] = [];

	for (const rawTx of rawTxs) {
		// Decode TX to human readable format
		const txData = CheqRegistry.decodeTx(rawTx.tx);

		if (txData.body && txData.body.messages) {
			for (const msg of txData.body.messages) {
				const txInfos = LumUtils.toJSON(CheqRegistry.decode(msg));
				if (typeof txInfos === 'object') {
					if (isSendTxInfo(txInfos)) {
						const tx: Transaction = {
							...txInfos,
							type: msg.typeUrl,
							height: rawTx.height,
							hash: LumUtils.toHex(rawTx.hash).toUpperCase(),
						};
						if (!alreadyExists(formattedTxs, tx)) {
							formattedTxs.push(tx);
						}
					} else if (isStakingTxInfo(txInfos)) {
						const fromAddress = txInfos.delegatorAddress;
						const toAddress = txInfos.validatorAddress;

						const tx: Transaction = {
							fromAddress,
							toAddress,
							type: msg.typeUrl,
							amount: [txInfos.amount],
							height: rawTx.height,
							hash: LumUtils.toHex(rawTx.hash).toUpperCase(),
						};

						if (!alreadyExists(formattedTxs, tx)) {
							formattedTxs.push(tx);
						}
					}
				}
			}
		}
	}

	return sortByBlockHeight(formattedTxs);
};

export const generateSignedMessage = async (wallet: Wallet, message: string): Promise<SignMsg> => {
	return await wallet.signMessage(encodeURI(message));
};

export const validateSignMessage = async (msg: SignMsg): Promise<boolean> => {
	return await verifySignMsg(msg);
};

class WalletClient {
	cheqClient!: CheqClient;
	cheqInfos: CheqInfo | null = null;
	wallet!: DirectSecp256k1HdWallet;
	chainId!: string;
	GasPrice!: GasPrice;

	// Init
	init = () => {
		CheqClient.connect(process.env.REACT_APP_RPC_URL).then(async (client: CheqClient) => {
			this.GasPrice = GasPrice.fromString('25' + NanoCheqDenom);
			const status = await client.status();
			this.cheqClient = client;
			this.chainId = await client.getChainId();
			this.cheqInfos = await this.getCheqInfo();
		});
	};

	// Getters

	private getCheqInfo = async (): Promise<CheqInfo | null> => {
		const [cheqInfos, previousDayCheqInfos] = await Promise.all([
			axios.get(`${OSMOSIS_API_URL}/tokens/v2/CHEQ`).catch(() => null),
			axios.get(`${OSMOSIS_API_URL}/tokens/v2/historical/CHEQ/chart?tf=1440`).catch(() => null),
		]);

		const cheqInfoData = cheqInfos && cheqInfos.data[0];
		const previousDayLumInfoData = previousDayCheqInfos && previousDayCheqInfos.data;

		if (isCheqInfo(cheqInfoData)) {
			const previousDaysPrices = Array.isArray(previousDayLumInfoData)
				? previousDayLumInfoData.filter(isPreviousDayCheqInfo)
				: [];

			return {
				...cheqInfoData,
				previousDaysPrices,
			};
		}

		return null;
	};

	private getAccountAndChainId = (fromWallet: Wallet) => {
		if (this.cheqClient === null) {
			return;
		}

		return Promise.all([this.cheqClient.getAccount(fromWallet.getAddress()), this.chainId]);
	};

	private getValidators = async () => {
		if (this.cheqClient === null) {
			return null;
		}
		const { validators } = this.cheqClient.queryClient.staking;

		try {
			const [bondedValidators, unbondedValidators] = await Promise.all([
				validators('BOND_STATUS_BONDED'),
				validators('BOND_STATUS_UNBONDED'),
			]);

			return { bonded: bondedValidators.validators, unbonded: unbondedValidators.validators };
		} catch (e) {}
	};

	getValidatorsInfos = async (address: string) => {
		if (!this.cheqClient) {
			return null;
		}

		try {
			const validators = await this.getValidators();

			const [delegation, unbonding] = await Promise.all([
				this.cheqClient.queryClient.staking.delegatorDelegations(address),
				this.cheqClient.queryClient.staking.delegatorUnbondingDelegations(address),
			]);

			const delegations = delegation.delegationResponses;
			const unbondings = unbonding.unbondingResponses;

			let unbondedTokens = 0;
			let stakedCoins = 0;

			for (const delegation of delegations) {
				if (delegation.balance) {
					stakedCoins += Number(LumUtils.convertUnit(delegation.balance, CheqDenom));
				}
			}

			for (const unbonding of unbondings) {
				for (const entry of unbonding.entries) {
					unbondedTokens += Number(
						LumUtils.convertUnit({ amount: entry.balance, denom: NanoCheqDenom }, CheqDenom),
					);
				}
			}

			return {
				bonded: validators?.bonded || [],
				unbonded: validators?.unbonded || [],
				delegations,
				unbondings,
				stakedCoins,
				unbondedTokens,
			};
		} catch (e) {}
	};

	getWalletBalance = async (address: string) => {
		if (this.cheqClient === null) {
			return null;
		}

		let cheq = 0;
		let fiat = 0;

		const balances = await this.cheqClient.getAllBalances(address);
		if (balances.length > 0) {
			for (const balance of balances) {
				cheq += Number(convertCoin(balance.amount, NanoCheqDenom));
			}
		}

		if (this.cheqInfos) {
			fiat = cheq * this.cheqInfos.price;
		}

		return {
			currentBalance: {
				cheq,
				fiat,
			},
		};
	};

	getVestingsInfos = async (address: string) => {
		if (this.cheqClient === null) {
			return null;
		}

		try {
			const account = await this.cheqClient.getAccount(address);
			if (account) {
				const { lockedBankCoins, lockedDelegatedCoins, lockedCoins, endsAt } = estimatedVesting(account);
				return { lockedBankCoins, lockedDelegatedCoins, lockedCoins, endsAt };
			}

			return null;
		} catch {
			return null;
		}
	};

	// eslint-disable-next-line
	getAirdropInfos = async (address: string) => {
		if (this.cheqClient === null) {
			return null;
		}

		return {
			amount: 904390583958085,
			vote: 9834905,
			delegate: 983450984,
		};

		// try {
		//     const airdrop = await this.cheqClient.queryClient.airdrop.claimRecord(address);

		//     if (airdrop.claimRecord) {
		//         const { initialClaimableAmount, actionCompleted } = airdrop.claimRecord;
		//         const [vote, delegate] = actionCompleted;

		//         let amount = initialClaimableAmount.reduce(
		//             (acc: number, coin: Coin) => acc + Number(LumUtils.convertUnit(coin, CheqDenom)),
		//             0,
		//         );

		//         if (vote && delegate) {
		//             amount = 0;
		//         } else if (vote || delegate) {
		//             amount = amount / 2;
		//         }

		//         return {
		//             amount,
		//             vote,
		//             delegate,
		//         };
		//     }

		//     return null;
		// } catch {
		//     return null;
		// }
	};

	getTransactions = async (address: string) => {
		if (this.cheqClient === null) {
			return null;
		}

		const transactions = await this.cheqClient.searchTx([
			LumUtils.searchTxByTags([{ key: 'transfer.recipient', value: address }]),
			LumUtils.searchTxByTags([{ key: 'transfer.sender', value: address }]),
		]);

		return await formatTxs(transactions);
	};

	getRewards = async (address: string) => {
		if (this.cheqClient === null) {
			return null;
		}

		return await this.cheqClient.queryClient.distribution.delegationTotalRewards(address);
	};

	getProposals = async (): Promise<Proposal[] | null> => {
		if (this.cheqClient === null) {
			return null;
		}

		const result = await this.cheqClient.queryClient.gov.proposals(
			ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED |
				ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD |
				ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD |
				ProposalStatus.PROPOSAL_STATUS_PASSED |
				ProposalStatus.PROPOSAL_STATUS_REJECTED |
				ProposalStatus.PROPOSAL_STATUS_FAILED |
				ProposalStatus.UNRECOGNIZED,
			'',
			'',
		);

		// eslint-disable-next-line
		return result.proposals.map((proposal: any) => ({
			...proposal,
			content: proposal.content ? CheqRegistry.decode(proposal.content) : proposal.content,
			finalResult: {
				yes: Number(proposal.finalTallyResult?.yes) || 0,
				no: Number(proposal.finalTallyResult?.no) || 0,
				noWithVeto: Number(proposal.finalTallyResult?.noWithVeto) || 0,
				abstain: Number(proposal.finalTallyResult?.abstain) || 0,
			},
		}));
	};

	getProposalTally = async (id: string) => {
		if (this.cheqClient === null) {
			return null;
		}

		const result = await this.cheqClient.queryClient.gov.tally(id);

		if (!result || !result.tally) {
			return null;
		}

		return {
			yes: Number(result.tally.yes),
			no: Number(result.tally.no),
			noWithVeto: Number(result.tally.noWithVeto),
			abstain: Number(result.tally.abstain),
		};
	};

	// Operations

	sendTx = async (fromWallet: Wallet, toAddress: string, cheqAmount: string, memo = '') => {
		if (this.cheqClient === null) {
			return null;
		}

		const amount = coin(Number(cheqAmount) * 10 ** 9, NanoCheqDenom);
		const result = await this.getAccountAndChainId(fromWallet);
		if (!result) {
			return null;
		}

		const address = fromWallet.getAddress();
		const [chainId] = result;

		if (!address || !chainId) {
			return null;
		}

		const msg = {
			typeUrl: MsgSendUrl,
			value: MsgSend.fromPartial({
				fromAddress: address,
				toAddress: toAddress,
				amount: [amount],
			}),
		};

		try {
			const broadcastResult = await this.cheqClient.signAndBroadcastTx(fromWallet, [msg], 'auto', memo);
			// @ts-ignore
			assertIsDeliverTxSuccess(broadcastResult);
			// @ts-ignore
			return {
				hash: broadcastResult?.transactionHash,
			};
		} catch (err) {
			return {
				// when we reject keplr txn, it throws an empty 'object' i.e. {} as error
				error: !err || typeof err === 'object' ? 'Unhandled exception occured' : err,
			};
		}
	};

	delegate = async (fromWallet: Wallet, validatorAddress: string, cheqAmount: string, memo: string) => {
		if (this.cheqClient === null) {
			return null;
		}

		// Convert cheq to ncheq
		const amount = coin(Number(cheqAmount) * 10 ** 9, NanoCheqDenom);
		const address = fromWallet.getAddress();
		const msg = {
			typeUrl: MsgDelegateUrl,
			value: MsgDelegate.fromJSON({
				delegatorAddress: address,
				validatorAddress: validatorAddress,
				amount: amount,
			}),
		};

		// Fetch account number and sequence and chain id
		const result = await this.getAccountAndChainId(fromWallet);
		if (!result) {
			return null;
		}

		const [chainId] = result;
		if (!address || !chainId) {
			return null;
		}

		try {
			// @ts-ignore
			const broadcastResult = await this.cheqClient.signAndBroadcastTx(fromWallet, [msg], 'auto', memo);
			// Verify the transaction was successfully broadcasted and made it into a block
			// @ts-ignore
			assertIsDeliverTxSuccess(broadcastResult);
			return {
				hash: broadcastResult.transactionHash,
			};
			// eslint-disable-next-line
		} catch (err: any) {
			return {
				hash: '',
				error: err,
			};
		}
	};

	undelegate = async (fromWallet: Wallet, validatorAddress: string, cheqAmount: string, memo: string) => {
		if (this.cheqClient === null) {
			return null;
		}

		const amount = coin(Number(cheqAmount) * 10 ** 9, NanoCheqDenom);
		const address = fromWallet.getAddress();
		const msg = {
			typeUrl: MsgUndelegateUrl,
			value: MsgUndelegate.fromJSON({
				delegatorAddress: address,
				validatorAddress: validatorAddress,
				amount: amount,
			}),
		};

		// Fetch account number and sequence and chain id
		const result = await this.getAccountAndChainId(fromWallet);

		if (!result) {
			return null;
		}

		const [chainId] = result;

		if (!address || !chainId) {
			return null;
		}

		try {
			// @ts-ignore
			const broadcastResult = await this.cheqClient.signAndBroadcastTx(fromWallet, [msg], 'auto', memo);
			// @ts-ignore Verify the transaction was successfully broadcasted and made it into a block
			assertIsDeliverTxSuccess(broadcastResult);
			return {
				hash: broadcastResult.transactionHash,
			};
			// eslint-disable-next-line
		} catch (err: any) {
			return {
				hash: '',
				error: err,
			};
		}
	};

	getReward = async (fromWallet: Wallet, validatorAddress: string, memo: string) => {
		if (this.cheqClient === null) {
			return null;
		}

		const address = fromWallet.getAddress();
		const msg = {
			typeUrl: MsgWithdrawDelegatorRewardUrl,
			value: MsgWithdrawDelegatorReward.fromJSON({
				delegatorAddress: address,
				validatorAddress: validatorAddress,
			}),
		};

		// Fetch account number and sequence and chain id
		const result = await this.getAccountAndChainId(fromWallet);
		if (!result) {
			return null;
		}

		const [chainId] = result;
		if (!address || !chainId) {
			return null;
		}

		try {
			// @ts-ignore
			const broadcastResult = await this.cheqClient.signAndBroadcastTx(fromWallet, [msg], 'auto', memo);
			// Verify the transaction was successfully broadcasted and made it into a block
			// @ts-ignore
			assertIsDeliverTxSuccess(broadcastResult);
			return {
				hash: broadcastResult.transactionHash,
			};
			// eslint-disable-next-line
		} catch (err: any) {
			return {
				hash: '',
				error: err,
			};
		}
	};

	getAllRewards = async (fromWallet: Wallet, validatorsAddresses: string[], memo: string) => {
		if (this.cheqClient === null) {
			return null;
		}

		const address = fromWallet.getAddress();
		const messages = [];
		const limit = fromWallet.isNanoS ? 6 : undefined;

		for (const [index, valAdd] of validatorsAddresses.entries()) {
			messages.push({
				typeUrl: MsgWithdrawDelegatorRewardUrl,
				value: MsgWithdrawDelegatorReward.fromJSON({
					delegatorAddress: address,
					validatorAddress: valAdd,
				}),
			});
			if (limit && index + 1 === limit) break;
		}

		// Fetch account number and sequence and chain id
		const result = await this.getAccountAndChainId(fromWallet);
		if (!result) {
			return null;
		}

		const [chainId] = result;
		if (!address || !chainId) {
			return null;
		}

		try {
			// @ts-ignore
			const broadcastResult = await this.cheqClient.signAndBroadcastTx(fromWallet, messages, 'auto', memo);
			// Verify the transaction was successfully broadcasted and made it into a block
			// @ts-ignore
			assertIsDeliverTxSuccess(broadcastResult);
			return {
				hash: broadcastResult.transactionHash,
			};
			// eslint-disable-next-line
		} catch (err: any) {
			return {
				hash: '',
				error: err,
			};
		}
	};

	redelegate = async (
		fromWallet: Wallet,
		validatorSrcAddress: string,
		validatorDestAddress: string,
		cheqAmount: string,
		memo: string,
	) => {
		if (this.cheqClient === null) {
			return null;
		}
		// Convert cheq to ncheq
		const amount = coin(Number(cheqAmount) * 10 ** 9, NanoCheqDenom);
		const address = await fromWallet.getAddress();
		const msg = {
			typeUrl: MsgBeginRedelegateUrl,
			value: MsgBeginRedelegate.fromJSON({
				delegatorAddress: address,
				validatorSrcAddress: validatorSrcAddress,
				validatorDstAddress: validatorDestAddress,
				amount: amount,
			}),
		};

		// Fetch account number and sequence and chain id
		const result = await this.getAccountAndChainId(fromWallet);
		if (!result) {
			return null;
		}

		const [chainId] = result;
		if (!address || !chainId) {
			return null;
		}

		try {
			// @ts-ignore
			const broadcastResult = await this.cheqClient.signAndBroadcastTx(fromWallet, [msg], 'auto', memo);
			// Verify the transaction was successfully broadcasted and made it into a block
			// @ts-ignore
			assertIsDeliverTxSuccess(broadcastResult);
			return {
				hash: broadcastResult.transactionHash,
			};
			// eslint-disable-next-line
		} catch (err: any) {
			return {
				hash: '',
				error: err,
			};
		}
	};

	vote = async (fromWallet: Wallet, proposalId: string, vote: VoteOption) => {
		if (this.cheqClient === null) {
			return null;
		}

		const address = await fromWallet.getAddress();
		const msg = {
			typeUrl: MsgVoteUrl,
			value: MsgVote.fromJSON({
				proposalId: proposalId,
				voter: address,
				option: vote,
			}),
		};

		// Fetch account number and sequence and chain id
		const result = await this.getAccountAndChainId(fromWallet);
		if (!result) {
			return null;
		}

		const [chainId] = result;
		if (!address || !chainId) {
			return null;
		}

		try {
			const broadcastResult = await this.cheqClient.signAndBroadcastTx(fromWallet, [msg], 'auto', '');
			// Verify the transaction was successfully broadcasted and made it into a block
			// @ts-ignore
			assertIsDeliverTxSuccess(broadcastResult);
			return {
				hash: broadcastResult.transactionHash,
			};
			// eslint-disable-next-line
		} catch (err: any) {
			return {
				hash: '',
				error: err,
			};
		}
	};

	initialiseClient = (client: SigningStargateClient) => {
		this.cheqClient.withStargateSigninClient(client);
	};
}

/**
 * Verify that a signature is valid
 *
 * @param signature signature (as generated by the generateSignature function)
 * @param signedBytes signed bytes (as generated by the generateSignDocBytes function or by the signMessage function)
 * @param publicKey public key of the signing key pair (secp256k1)
 */
export const verifySignature = async (
	signature: Uint8Array,
	signedBytes: Uint8Array,
	publicKey: Uint8Array,
): Promise<boolean> => {
	// eslint-disable-next-line
	const valid = await Secp256k1.verifySignature(
		Secp256k1Signature.fromFixedLength(signature),
		sha256(signedBytes),
		publicKey,
	);
	return true;
	// return valid;
};

/**
 * Verify that a message is signed by the provided publicKey
 * Will also verify that the address is indeed derivated by the provided publicKey
 *
 * @param msg Message to verify such as generated by the LumWallet.signMessage method
 */
export const verifySignMsg = async (msg: SignMsg): Promise<boolean> => {
	const { prefix } = Bech32.decode(msg.address);
	if (getAddressFromPublicKey(msg.publicKey, prefix) !== msg.address) {
		return false;
	}
	if (msg.signer === CheqMessageSigner.PAPER) {
		return verifySignature(msg.sig, toAscii(msg.msg), msg.publicKey);
	} else if (msg.signer === CheqMessageSigner.OFFLINE) {
		const signDoc = {
			bodyBytes: toAscii(msg.msg),
			authInfoBytes: generateAuthInfoBytes(
				[{ accountNumber: 0, sequence: 0, publicKey: msg.publicKey }],
				{ amount: [], gas: '0' },
				SignMode.SIGN_MODE_DIRECT,
			),
			chainId: CheqSignOnlyChainId,
			accountNumber: Long.fromNumber(0),
		};
		const signedBytes = makeSignBytes(signDoc);
		return verifySignature(msg.sig, signedBytes, msg.publicKey);
	} else if (msg.signer === CheqMessageSigner.LEDGER) {
		// Re-generate ledger required amino payload to sign messages
		// This is basically an empty transaction payload
		// Same a used in the LumLedgerWallet > signMessage method
		const msgToSign = {
			account_number: '0',
			chain_id: CheqSignOnlyChainId,
			fee: {},
			memo: msg.msg,
			msgs: [],
			sequence: '0',
		};
		return verifySignature(msg.sig, toAscii(JSON.stringify(sortJSON(msgToSign))), msg.publicKey);
	}
	throw new Error('unknown message signer');
};

export default new WalletClient();
