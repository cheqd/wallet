import {
	DelegationResponse,
	UnbondingDelegation,
	Validator,
	// } from '@cosmjs/stargate/build/modules/index';
} from 'cosmjs-types/cosmos/staking/v1beta1/staking';
import { CLIENT_PRECISION } from 'constant';
import { Rewards, UserValidator } from 'models';
import { NumbersUtils } from '.';
import { Timestamp } from 'cosmjs-types/google/protobuf/timestamp';

export const calculateTotalVotingPower = (validators: Validator[]): number => {
	if (!validators || !validators.length) {
		return 0;
	}

	return validators.reduce((acc, validator) => acc + parseFloat(validator.tokens || '0'), 0);
};

export const sortByVotingPower = (validators: Validator[], totalVotingPower: number): Validator[] => {
	return validators.sort((valA, valB) => {
		if (totalVotingPower > 0) {
			return (
				NumbersUtils.convertUnitNumber(valB.tokens || 0) / totalVotingPower -
				NumbersUtils.convertUnitNumber(valA.tokens || 0) / totalVotingPower
			);
		}
		return 0;
	});
};

export const unbondingsTimeRemaining = (unbondings: UnbondingDelegation[]): Timestamp | undefined => {
	let time = undefined;

	for (const unbonding of unbondings) {
		for (const entry of unbonding.entries) {
			if (!time) {
				time = entry.completionTime;
			} else {
				if (entry.completionTime && entry.completionTime < time) {
					time = entry.completionTime;
				}
			}
		}
	}

	return time;
};

export const getUserValidators = (
	bondedValidators: Validator[],
	unbondedValidators: Validator[],
	delegations: DelegationResponse[],
	rewards: Rewards,
): UserValidator[] => {
	const validators = [];

	for (const delegation of delegations) {
		for (const reward of rewards.rewards) {
			if (delegation.delegation && reward.validatorAddress === delegation.delegation.validatorAddress) {
				const validator =
					bondedValidators.find(
						(bondedVal) =>
							delegation.delegation &&
							bondedVal.operatorAddress === delegation.delegation.validatorAddress,
					) ||
					unbondedValidators.find(
						(unbondedVal) =>
							delegation.delegation &&
							unbondedVal.operatorAddress === delegation.delegation.validatorAddress,
					);

				if (validator) {
					validators.push({
						...validator,
						reward: parseFloat(reward.reward.length > 0 ? reward.reward[0].amount : '0') / CLIENT_PRECISION,
						stakedCoins: NumbersUtils.formatTo6digit(
							NumbersUtils.convertUnitNumber(delegation.delegation.shares || 0) / CLIENT_PRECISION,
						),
					});
				}
			}
		}
	}

	return validators;
};
