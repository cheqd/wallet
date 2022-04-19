import axios from 'axios';
import { broadcastTxCommitSuccess, TxResponse } from '@cosmjs/tendermint-rpc';
import { Secp256k1, Secp256k1Signature } from '@cosmjs/crypto';
import {
	assertIsDeliverTxSuccess,
	SigningStargateClient,
	StargateClient,
	coin,
	GasPrice,
	calculateFee,
	StdFee,
} from '@cosmjs/stargate';
import { LumMessages, LumUtils } from '@lum-network/sdk-javascript';
import { ProposalStatus, VoteOption } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { Coin, Fee } from '@lum-network/sdk-javascript/build/types';
import { OSMOSIS_API_URL } from 'constant';
import i18n from 'locales';
import Long from 'long';
import { CheqInfo, PasswordStrength, PasswordStrengthType, Proposal, Transaction, Wallet } from 'models';
import { CheqClient } from 'network/cheqd';
import { CheqRegistry } from 'network/modules/registry';
import { SignMsg } from 'network/types/signMsg';
import { showErrorToast } from 'utils';
import {
	CheqBech32PrefixAccAddr,
	CheqDenom,
	CheqExponent,
	CheqMessageSigner,
	CheqSignOnlyChainId,
	NanoCheqDenom,
} from '../network/constants';
import { sortByBlockHeight } from './transactions';
import {
	Bech32,
	convertUnit,
	generateAuthInfoBytes,
	generateSignDocBytes,
	getAddressFromPublicKey,
	sha256,
	sortJSON,
	toAscii,
} from '@lum-network/sdk-javascript/build/utils';
import { SignMode } from '@lum-network/sdk-javascript/build/codec/cosmos/tx/signing/v1beta1/signing';
import { Doc } from 'network/types/msg';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { convertCoin } from 'network/util';
import { MsgDelegate, MsgUndelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx';
import { MsgDelegateUrl, MsgUndelegateUrl } from '@lum-network/sdk-javascript/build/messages';

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
	cheqClient: CheqClient | null = null;
	cheqInfos: CheqInfo | null = null;
	wallet: DirectSecp256k1HdWallet | undefined;
	chainId: string | null = null;
	signinClient: SigningStargateClient | null = null;

	GasPrice: GasPrice | undefined;

	// Init
	init = (signinClient?: SigningStargateClient) => {
		CheqClient.connect(process.env.REACT_APP_RPC_URL).then(async (client: CheqClient) => {
			this.GasPrice = GasPrice.fromString('25' + NanoCheqDenom);
			this.cheqClient = client;
			this.chainId = await client.getChainId();
			this.cheqInfos = await this.getCheqInfo();
		});
	};

	// Getters

	private getCheqInfo = async (): Promise<CheqInfo | null> => {
		const [cheqInfos, previousDayCheqInfos] = await Promise.all([
			axios.get(`${OSMOSIS_API_URL}/tokens/v2/CHEQ`).catch(() => null),
			axios.get(`${OSMOSIS_API_URL}/tokens/v1/historical/CHEQ/chart?range=7d`).catch(() => null),
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
				const { lockedBankCoins, lockedDelegatedCoins, lockedCoins, endsAt } =
					LumUtils.estimatedVesting(account);

				return { lockedBankCoins, lockedDelegatedCoins, lockedCoins, endsAt };
			}

			return null;
		} catch {
			return null;
		}
	};

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
		const mn = localStorage.getItem('mn');
		// @ts-ignore
		this.setHDWallet(mn);

		const amount = coin(Number(cheqAmount) * 10 ** 9, NanoCheqDenom);

		// Convert Cheq to nCheq
		// const amount = LumUtils.convertUnit({ denom: CheqDenom, amount: cheqAmount }, NanoCheqDenom);
		// console.log('trying convertUnit');

		// Build transaction message
		// const sendMsg = LumMessages.BuildMsgSend(fromWallet.getAddress(), toAddress, [
		// 	{ denom: NanoCheqDenom, amount: amount.amount },
		// ]);
		// Define fees
		// 2000000000ncheq
		const defaultGasPrice = GasPrice.fromString('25' + NanoCheqDenom);
		// const defaultSendFee: StdFee = calculateFee(8000000000, defaultGasPrice);
		// const fee: Fee = { amount: [ { denom: NanoCheqDenom, amount: amount, }, ], gas: '100000' }
		const fee = {
			amount: [{ denom: NanoCheqDenom, amount: '3500000' }],
			gas: this.GasPrice,
		};
		// Fetch account number and sequence and chain id
		const result = await this.getAccountAndChainId(fromWallet);
		if (!result) {
			return null;
		}

		// @ts-ignore
		const [account] = await this.wallet.getAccounts();
		const [chainId] = result;

		if (!account || !chainId) {
			return null;
		}

		try {
			const broadcastResult = await this.signinClient?.sendTokens(account.address, toAddress, [amount], 'auto');
			// @ts-ignore
			const broadcasted = assertIsDeliverTxSuccess(broadcastResult);
			return {
				hash: broadcastResult?.transactionHash,
			};
		} catch (err) {
			return {
				error: err,
			};
		}
	};

	delegate = async (fromWallet: Wallet, validatorAddress: string, cheqAmount: string, memo: string) => {
		if (this.cheqClient === null) {
			return null;
		}
		const mn = localStorage.getItem('mn');
		// @ts-ignore
		this.setHDWallet(mn);

		// Convert cheq to ncheq
		const amount = coin(Number(cheqAmount) * 10 ** 9, NanoCheqDenom);
		//
		// @ts-ignore
		const [account] = await this.wallet.getAccounts();
		const msg = {
			typeUrl: MsgDelegateUrl,
			value: MsgDelegate.fromJSON({
				delegatorAddress: account.address,
				validatorAddress: validatorAddress,
				amount: amount,
			}),
		};
		// Define fees
		const fee = {
			amount: [{ denom: NanoCheqDenom, amount: '25000' }],
			gas: '200000',
		};

		// Fetch account number and sequence and chain id
		const result = await this.getAccountAndChainId(fromWallet);

		if (!result) {
			return null;
		}

		const [chainId] = result;

		if (!account || !chainId) {
			return null;
		}

		try {
			// @ts-ignore
			const broadcastResult = await this.signinClient.signAndBroadcast(account.address, [msg], 'auto', memo);
			// Verify the transaction was successfully broadcasted and made it into a block
			// const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);
			// @ts-ignore
			assertIsDeliverTxSuccess(broadcastResult);
			return {
				hash: broadcastResult.transactionHash,
				// error: !broadcasted
				// 	? broadcastResult.deliverTx && broadcastResult.deliverTx.log
				// 		? broadcastResult.deliverTx.log
				// 		: broadcastResult.checkTx.log
				// 	: null,
			};
		} catch (err: any) {
			return {
				hash: '',
				error: err,
				// hash: broadcastResult?.transactionHash,
				// error: !broadcasted
				// 	? broadcastResult.deliverTx && broadcastResult.deliverTx.log
				// 		? broadcastResult.deliverTx.log
				// 		: broadcastResult.checkTx.log
				// 	: null,
			};
		}
	};

	undelegate = async (fromWallet: Wallet, validatorAddress: string, cheqAmount: string, memo: string) => {
		if (this.cheqClient === null) {
			return null;
		}

		const amount = coin(Number(cheqAmount) * 10 ** 9, NanoCheqDenom);
		// @ts-ignore
		const [account] = await this.wallet.getAccounts();
		const msg = {
			typeUrl: MsgUndelegateUrl,
			value: MsgUndelegate.fromJSON({
				delegatorAddress: account.address,
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

		if (!account || !chainId) {
			return null;
		}

		try {
			// @ts-ignore
			const broadcastResult = await this.signinClient.signAndBroadcast(account.address, [msg], 'auto', memo);
			// @ts-ignore Verify the transaction was successfully broadcasted and made it into a block
			assertIsDeliverTxSuccess(broadcastResult);
			return {
				hash: broadcastResult.transactionHash,
			};
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

		const getRewardMsg = LumMessages.BuildMsgWithdrawDelegatorReward(fromWallet.getAddress(), validatorAddress);

		// Define fees
		const fee = {
			amount: [{ denom: NanoCheqDenom, amount: '25000' }],
			gas: '140000',
		};

		// Fetch account number and sequence and chain id
		const result = await this.getAccountAndChainId(fromWallet);

		if (!result) {
			return null;
		}

		const [account, chainId] = result;

		if (!account || !chainId) {
			return null;
		}

		const { accountNumber, sequence } = account;

		const doc: Doc = {
			chainId,
			fee,
			memo,
			messages: [getRewardMsg],
			signers: [
				{
					accountNumber,
					sequence,
					publicKey: fromWallet.getPublicKey(),
				},
			],
		};

		const broadcastResult = await this.cheqClient.signAndBroadcastTx(fromWallet, doc);
		// Verify the transaction was successfully broadcasted and made it into a block
		const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);

		return {
			hash: broadcastResult.hash,
			error: !broadcasted
				? broadcastResult.deliverTx && broadcastResult.deliverTx.log
					? broadcastResult.deliverTx.log
					: broadcastResult.checkTx.log
				: null,
		};
	};

	getAllRewards = async (fromWallet: Wallet, validatorsAddresses: string[], memo: string) => {
		if (this.cheqClient === null) {
			return null;
		}

		const messages = [];
		const limit = fromWallet.isNanoS ? 6 : undefined;
		let gas = 140000;

		for (const [index, valAdd] of validatorsAddresses.entries()) {
			messages.push(LumMessages.BuildMsgWithdrawDelegatorReward(fromWallet.getAddress(), valAdd));
			if (index > 0) {
				gas += 80000;
			}
			if (limit && index + 1 === limit) break;
		}

		// Define fees
		const fee = {
			amount: [{ denom: NanoCheqDenom, amount: '25000' }],
			gas: gas.toString(),
		};

		// Fetch account number and sequence and chain id
		const result = await this.getAccountAndChainId(fromWallet);

		if (!result) {
			return null;
		}

		const [account, chainId] = result;

		if (!account || !chainId) {
			return null;
		}

		const { accountNumber, sequence } = account;

		const doc: Doc = {
			chainId,
			fee,
			memo,
			messages,
			signers: [
				{
					accountNumber,
					sequence,
					publicKey: fromWallet.getPublicKey(),
				},
			],
		};

		const broadcastResult = await this.cheqClient.signAndBroadcastTx(fromWallet, doc);
		// Verify the transaction was successfully broadcasted and made it into a block
		const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);

		return {
			hash: broadcastResult.hash,
			error: !broadcasted
				? broadcastResult.deliverTx && broadcastResult.deliverTx.log
					? broadcastResult.deliverTx.log
					: broadcastResult.checkTx.log
				: null,
		};
	};

	redelegate = async (
		fromWallet: Wallet,
		validatorScrAddress: string,
		validatorDestAddress: string,
		lumAmount: string,
		memo: string,
	) => {
		if (this.cheqClient === null) {
			return null;
		}
		const mn = localStorage.getItem('mn');
		// @ts-ignore
		this.setHDWallet(mn);

		// Convert Lum to uLum
		const amount = LumUtils.convertUnit({ denom: CheqDenom, amount: lumAmount }, NanoCheqDenom);

		const redelegateMsg = LumMessages.BuildMsgBeginRedelegate(
			fromWallet.getAddress(),
			validatorScrAddress,
			validatorDestAddress,
			{
				amount,
				denom: NanoCheqDenom,
			},
		);

		// Define fees
		const fee = {
			amount: [{ denom: NanoCheqDenom, amount: '25000' }],
			gas: '300000',
		};

		// Fetch account number and sequence and chain id
		const result = await this.getAccountAndChainId(fromWallet);

		if (!result) {
			return null;
		}

		const [account, chainId] = result;

		if (!account || !chainId) {
			return null;
		}

		const { accountNumber, sequence } = account;

		const doc: Doc = {
			chainId,
			fee,
			memo,
			messages: [redelegateMsg],
			signers: [
				{
					accountNumber,
					sequence,
					publicKey: fromWallet.getPublicKey(),
				},
			],
		};

		const broadcastResult = await this.cheqClient.signAndBroadcastTx(fromWallet, doc);
		// Verify the transaction was successfully broadcasted and made it into a block
		const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);

		return {
			hash: broadcastResult.hash,
			error: !broadcasted
				? broadcastResult.deliverTx && broadcastResult.deliverTx.log
					? broadcastResult.deliverTx.log
					: broadcastResult.checkTx.log
				: null,
		};
	};

	setHDWallet = async (mnemonic: string) => {
		const w = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
			prefix: CheqBech32PrefixAccAddr,
		});
		this.wallet = w;

		try {
			this.signinClient = await SigningStargateClient.connectWithSigner(process.env.REACT_APP_RPC_URL, w, {
				gasPrice: this.GasPrice,
			});
		} catch (err: any) {
			showErrorToast(i18n.t('wallet.errors.client'));
		}
	};

	vote = async (fromWallet: Wallet, proposalId: string, vote: VoteOption) => {
		if (this.cheqClient === null) {
			return null;
		}
		const mn = localStorage.getItem('mn');
		// @ts-ignore
		this.setHDWallet(mn);

		// Fixme: Update JS SDK to use right type
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		const voteMsg = LumMessages.BuildMsgVote(new Long(Number(proposalId)), fromWallet.getAddress(), Number(vote));

		// Define fees
		const fee = {
			amount: [{ denom: NanoCheqDenom, amount: '25000' }],
			gas: '100000',
		};

		// Fetch account number and sequence and chain id
		const result = await this.getAccountAndChainId(fromWallet);

		if (!result) {
			return null;
		}

		const [account, chainId] = result;

		if (!account || !chainId) {
			return null;
		}

		const { accountNumber, sequence } = account;

		const doc: Doc = {
			chainId,
			fee,
			messages: [voteMsg],
			memo: '',
			signers: [
				{
					accountNumber,
					sequence,
					publicKey: fromWallet.getPublicKey(),
				},
			],
		};

		// @ts-ignore
		const broadcastResult = await this.cheqClient.signAndBroadcastTx(fromWallet, doc);
		// Verify the transaction was successfully broadcasted and made it into a block
		const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);

		return {
			hash: broadcastResult.hash,
			error: !broadcasted
				? broadcastResult.deliverTx && broadcastResult.deliverTx.log
					? broadcastResult.deliverTx.log
					: broadcastResult.checkTx.log
				: null,
		};
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
		const signedBytes = generateSignDocBytes(signDoc);
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
