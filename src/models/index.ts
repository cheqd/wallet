import { CheqWallet } from '../network/wallet';
import { Validator } from 'cosmjs-types/cosmos/staking/v1beta1/staking';
import { Proposal as BaseProposal } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { Models } from '@rematch/core';
import { governance } from '../redux/models/governance';
import { staking } from '../redux/models/staking';
import { wallet } from '../redux/models/wallet';
import { identity } from '../redux/models/identity';
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';
import { IIdentifier, MinimalImportableIdentifier, VerifiableCredential } from '@veramo/core';

export interface RootModel extends Models<RootModel> {
	wallet: typeof wallet;
	staking: typeof staking;
	governance: typeof governance;
	identity: typeof identity;
}

export const reduxModels: RootModel = { wallet, staking, governance, identity };

export interface Wallet extends CheqWallet {
	isExtensionImport?: boolean;
	isNanoS?: boolean;
}

export interface CommonTransactionProps {
	type: string;
	hash: string;
	height: number;
	amount: Coin[];
	//time: string;
	memo?: string;
	success?: boolean;
	[key: string]: string | Coin[] | number | boolean | undefined;
}

export interface Transaction extends CommonTransactionProps {
	fromAddress: string;
	toAddress: string;
}

export interface StakingTransaction extends CommonTransactionProps {
	delegatorAddress: string;
	validatorAddress: string;
}

export interface Reward {
	validatorAddress: string;
	reward: Coin[];
}

export interface Rewards {
	rewards: Reward[];
	total: Coin[];
}

export interface UserValidator extends Validator {
	reward: number;
	stakedCoins: string;
}

export enum PasswordStrengthType {
	Strong = 'strong',
	Medium = 'medium',
	Weak = 'weak',
}

export type PasswordStrength = PasswordStrengthType.Weak | PasswordStrengthType.Medium | PasswordStrengthType.Strong;

export enum SoftwareMethod {
	Mnemonic = 'mnemonic',
	PrivateKey = 'privateKey',
	Keystore = 'keystore',
}

export enum ExtensionMethod {
	Keplr = 'keplr',
}

export enum HardwareMethod {
	Cosmos = 'cosmos',
	Cheq = 'cheqd',
}

export interface Vestings {
	endsAt: Date;
	lockedCoins: Coin;
	lockedBankCoins: Coin;
	lockedDelegatedCoins: Coin;
}

export interface Airdrop {
	amount: number;
	vote: boolean;
	delegate: boolean;
}

export interface VotesResult {
	yes: number;
	no: number;
	noWithVeto: number;
	abstain: number;
}

export interface Proposal extends Omit<BaseProposal, 'content'> {
	content: {
		title: string;
		description: string;
	};
	finalResult: VotesResult;
}

export interface PreviousDayPrice {
	open: number;
	high: number;
	close: number;
	low: number;
	time: number;
}

export interface CheqInfo {
	price: number;
	denom: string;
	symbol: string;
	liquidity: number;
	volume_24h: number;
	name: number;
	previousDaysPrices: PreviousDayPrice[];
}

export interface IdentityWallet {
	credentials: Credential[];
	dids: MinimalImportableIdentifier[];
}

export interface Credential extends VerifiableCredential{
	name: string | undefined;
	WebPage: WebPage[] | undefined;
	type: string[];
	issuer: Issuer;
	credentialSubject: CredentialSubject;
	issuanceDate: string;
}

export interface WebPage {
	description: string;
	name: string;
	identifier: string;
	URL: string;
}

export interface Issuer {
	id: string;
}

export interface CredentialSubject {
	id: string;
}
