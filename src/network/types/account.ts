import { Pubkey } from '@cosmjs/amino';
import { BaseAccount, ModuleAccount } from 'cosmjs-types/cosmos/auth/v1beta1/auth';
import {
	BaseVestingAccount,
	ContinuousVestingAccount,
	DelayedVestingAccount,
	PeriodicVestingAccount,
} from 'cosmjs-types/cosmos/vesting/v1beta1/vesting';

import Long from 'long';
import { Uint64 } from '@cosmjs/math';
import { assert } from '@cosmjs/utils';
import { decodePubkey } from '@cosmjs/proto-signing';

import { Any } from 'cosmjs-types/google/protobuf/any';

export interface Account {
	readonly address: string;
	readonly accountNumber: number;
	readonly sequence: number;
	readonly pubkey: Pubkey | null;
	readonly _moduleAccount?: ModuleAccount;
	readonly _baseVestingAccount?: BaseVestingAccount;
	readonly _continuousVestingAccount?: ContinuousVestingAccount;
	readonly _delayedVestingAccount?: DelayedVestingAccount;
	readonly _periodicVestingAccount?: PeriodicVestingAccount;
}

function uint64FromProto(input: Long) {
	return Uint64.fromString(input.toString());
}

function accountFromBaseAccount(input: BaseAccount): Account {
	const { address, pubKey, accountNumber, sequence } = input;
	const pubkey = decodePubkey(pubKey);
	return {
		address: address,
		pubkey: pubkey,
		accountNumber: uint64FromProto(accountNumber).toNumber(),
		sequence: uint64FromProto(sequence).toNumber(),
	};
}

export const accountFromAny = (input: Any): Account => {
	const { typeUrl, value } = input;
	switch (typeUrl) {
		case '/cosmos.auth.v1beta1.BaseAccount':
			return accountFromBaseAccount(BaseAccount.decode(value));
		case '/cosmos.auth.v1beta1.ModuleAccount': {
			const moduleAccount = ModuleAccount.decode(value);
			assert(moduleAccount.baseAccount);
			return Object.assign(accountFromBaseAccount(moduleAccount.baseAccount), { _moduleAccount: moduleAccount });
		}
		case '/cosmos.vesting.v1beta1.BaseVestingAccount': {
			const vestingAccount = BaseVestingAccount.decode(value);
			assert(vestingAccount.baseAccount);
			return Object.assign(accountFromBaseAccount(vestingAccount.baseAccount), {
				_baseVestingAccount: vestingAccount,
			});
		}
		case '/cosmos.vesting.v1beta1.ContinuousVestingAccount': {
			const vestingAccount = ContinuousVestingAccount.decode(value);
			assert(vestingAccount.baseVestingAccount);
			assert(vestingAccount.baseVestingAccount.baseAccount);
			return Object.assign(accountFromBaseAccount(vestingAccount.baseVestingAccount.baseAccount), {
				_continuousVestingAccount: vestingAccount,
			});
		}
		case '/cosmos.vesting.v1beta1.DelayedVestingAccount': {
			const vestingAccount = DelayedVestingAccount.decode(value);
			assert(vestingAccount.baseVestingAccount);
			assert(vestingAccount.baseVestingAccount.baseAccount);
			return Object.assign(accountFromBaseAccount(vestingAccount.baseVestingAccount.baseAccount), {
				_delayedVestingAccount: vestingAccount,
			});
		}
		case '/cosmos.vesting.v1beta1.PeriodicVestingAccount': {
			const vestingAccount = PeriodicVestingAccount.decode(value);
			assert(vestingAccount.baseVestingAccount);
			assert(vestingAccount.baseVestingAccount.baseAccount);
			return Object.assign(accountFromBaseAccount(vestingAccount.baseVestingAccount.baseAccount), {
				_periodicVestingAccount: vestingAccount,
			});
		}
		default:
			throw new Error(`Unsupported type: '${typeUrl}'`);
	}
};
