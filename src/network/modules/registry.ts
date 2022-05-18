import { Registry, GeneratedType } from '@cosmjs/proto-signing';
import { AminoConverters, AminoTypes } from '@cosmjs/stargate';
import {
	createAuthzAminoConverters,
	createBankAminoConverters,
	createDistributionAminoConverters,
	createFreegrantAminoConverters,
	createGovAminoConverters,
	createIbcAminoConverters,
	createStakingAminoConverters,
} from '@cosmjs/stargate/build/modules';

import { Tx } from '@lum-network/sdk-javascript/build/codec/cosmos/tx/v1beta1/tx';
import { PubKey } from '@lum-network/sdk-javascript/build/codec/cosmos/crypto/secp256k1/keys';
import {
	BaseAccount,
	ModuleAccount,
	Params as AuthParams,
} from '@lum-network/sdk-javascript/build/codec/cosmos/auth/v1beta1/auth';
import { MsgExec, MsgGrant, MsgRevoke } from '@lum-network/sdk-javascript/build/codec/cosmos/authz/v1beta1/tx';
import { MsgSend, MsgMultiSend } from '@lum-network/sdk-javascript/build/codec/cosmos/bank/v1beta1/tx';
import { Coin, DecCoin, DecProto, IntProto } from '@lum-network/sdk-javascript/build/codec/cosmos/base/v1beta1/coin';
import {
	CommunityPoolSpendProposal,
	CommunityPoolSpendProposalWithDeposit,
} from '@lum-network/sdk-javascript/build/codec/cosmos/distribution/v1beta1/distribution';
import {
	MsgFundCommunityPool,
	MsgSetWithdrawAddress,
	MsgWithdrawDelegatorReward,
	MsgWithdrawValidatorCommission,
} from '@lum-network/sdk-javascript/build/codec/cosmos/distribution/v1beta1/tx';
import {
	MsgGrantAllowance,
	MsgRevokeAllowance,
} from '@lum-network/sdk-javascript/build/codec/cosmos/feegrant/v1beta1/tx';
import { Proposal, TextProposal } from '@lum-network/sdk-javascript/build/codec/cosmos/gov/v1beta1/gov';
import { MsgDeposit, MsgSubmitProposal, MsgVote } from '@lum-network/sdk-javascript/build/codec/cosmos/gov/v1beta1/tx';
import { ParameterChangeProposal } from '@lum-network/sdk-javascript/build/codec/cosmos/params/v1beta1/params';
import { MsgUnjail } from '@lum-network/sdk-javascript/build/codec/cosmos/slashing/v1beta1/tx';
import {
	MsgBeginRedelegate,
	MsgCreateValidator,
	MsgDelegate,
	MsgEditValidator,
	MsgUndelegate,
} from '@lum-network/sdk-javascript/build/codec/cosmos/staking/v1beta1/tx';
import {
	CancelSoftwareUpgradeProposal,
	SoftwareUpgradeProposal,
} from '@lum-network/sdk-javascript/build/codec/cosmos/upgrade/v1beta1/upgrade';
import {
	BaseVestingAccount,
	ContinuousVestingAccount,
	DelayedVestingAccount,
	PeriodicVestingAccount,
} from '@lum-network/sdk-javascript/build/codec/cosmos/vesting/v1beta1/vesting';
import { MsgCreateVestingAccount } from '@lum-network/sdk-javascript/build/codec/cosmos/vesting/v1beta1/tx';
import { MsgCreateDid } from 'network/cheqd/v1/tx';
import { CheqDenom } from 'network/constants';
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import {
	MsgAcknowledgement,
	MsgChannelCloseConfirm,
	MsgChannelCloseInit,
	MsgChannelOpenAck,
	MsgChannelOpenConfirm,
	MsgChannelOpenInit,
	MsgChannelOpenTry,
	MsgRecvPacket,
	MsgTimeout,
	MsgTimeoutOnClose,
} from 'cosmjs-types/ibc/core/channel/v1/tx';
import {
	MsgCreateClient,
	MsgSubmitMisbehaviour,
	MsgUpdateClient,
	MsgUpgradeClient,
} from 'cosmjs-types/ibc/core/client/v1/tx';
import {
	MsgConnectionOpenAck,
	MsgConnectionOpenConfirm,
	MsgConnectionOpenInit,
	MsgConnectionOpenTry,
} from 'cosmjs-types/ibc/core/connection/v1/tx';
import { ClientUpdateProposal } from 'cosmjs-types/ibc/core/client/v1/client';

const registryTypes: Iterable<[string, GeneratedType]> = [
	['/cosmos.tx.v1beta1.TxBody', TxBody],
	['/cosmos.auth.v1beta1.BaseAccount', BaseAccount],
	['/cosmos.auth.v1beta1.ModuleAccount', ModuleAccount],
	['/cosmos.auth.v1beta1.Params', AuthParams],
	['/cosmos.authz.v1beta1.MsgGrant', MsgGrant],
	['/cosmos.authz.v1beta1.MsgExec', MsgExec],
	['/cosmos.authz.v1beta1.MsgRevoke', MsgRevoke],
	['/cosmos.bank.v1beta1.MsgSend', MsgSend],
	['/cosmos.bank.v1beta1.MsgMultiSend', MsgMultiSend],
	['/cosmos.base.v1beta1.Coin', Coin],
	['/cosmos.base.v1beta1.DecCoin', DecCoin],
	['/cosmos.base.v1beta1.IntProto', IntProto],
	['/cosmos.base.v1beta1.DecProto', DecProto],
	['/cosmos.crypto.ed25519.PubKey', PubKey],
	['/cosmos.crypto.secp256k1.PubKey', PubKey],
	['/cosmos.distribution.v1beta1.MsgFundCommunityPool', MsgFundCommunityPool],
	['/cosmos.distribution.v1beta1.MsgSetWithdrawAddress', MsgSetWithdrawAddress],
	['/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward', MsgWithdrawDelegatorReward],
	['/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission', MsgWithdrawValidatorCommission],
	['/cosmos.distribution.v1beta1.CommunityPoolSpendProposal', CommunityPoolSpendProposal],
	['/cosmos.distribution.v1beta1.CommunityPoolSpendProposalWithDeposit', CommunityPoolSpendProposalWithDeposit],
	['/cosmos.feegrant.v1beta1.MsgGrantAllowance', MsgGrantAllowance],
	['/cosmos.feegrant.v1beta1.MsgRevokeAllowance', MsgRevokeAllowance],
	['/cosmos.gov.v1beta1.MsgDeposit', MsgDeposit],
	['/cosmos.gov.v1beta1.MsgSubmitProposal', MsgSubmitProposal],
	['/cosmos.gov.v1beta1.MsgVote', MsgVote],
	['/cosmos.gov.v1beta1.Proposal', Proposal],
	['/cosmos.gov.v1beta1.TextProposal', TextProposal],
	['/cosmos.params.v1beta1.ParameterChangeProposal', ParameterChangeProposal],
	['/cosmos.slashing.v1beta1.MsgUnjail', MsgUnjail],
	['/cosmos.staking.v1beta1.MsgBeginRedelegate', MsgBeginRedelegate],
	['/cosmos.staking.v1beta1.MsgCreateValidator', MsgCreateValidator],
	['/cosmos.staking.v1beta1.MsgDelegate', MsgDelegate],
	['/cosmos.staking.v1beta1.MsgEditValidator', MsgEditValidator],
	['/cosmos.staking.v1beta1.MsgUndelegate', MsgUndelegate],
	['/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal', SoftwareUpgradeProposal],
	['/cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal', CancelSoftwareUpgradeProposal],
	['/cosmos.vesting.v1beta1.BaseVestingAccount', BaseVestingAccount],
	['/cosmos.vesting.v1beta1.ContinuousVestingAccount', ContinuousVestingAccount],
	['/cosmos.vesting.v1beta1.DelayedVestingAccount', DelayedVestingAccount],
	['/cosmos.vesting.v1beta1.PeriodicVestingAccount', PeriodicVestingAccount],
	['/cosmos.vesting.v1beta1.MsgCreateVestingAccount', MsgCreateVestingAccount],
	['/cheqdid.cheqdnode.cheqd.v1.MsgCreateDid', MsgCreateDid],
	['/ibc.core.client.v1.ClientUpdateProposal', ClientUpdateProposal],
	['/ibc.core.channel.v1.MsgChannelOpenInit', MsgChannelOpenInit],
	['/ibc.core.channel.v1.MsgChannelOpenTry', MsgChannelOpenTry],
	['/ibc.core.channel.v1.MsgChannelOpenAck', MsgChannelOpenAck],
	['/ibc.core.channel.v1.MsgChannelOpenConfirm', MsgChannelOpenConfirm],
	['/ibc.core.channel.v1.MsgChannelCloseInit', MsgChannelCloseInit],
	['/ibc.core.channel.v1.MsgChannelCloseConfirm', MsgChannelCloseConfirm],
	['/ibc.core.channel.v1.MsgRecvPacket', MsgRecvPacket],
	['/ibc.core.channel.v1.MsgTimeout', MsgTimeout],
	['/ibc.core.channel.v1.MsgTimeoutOnClose', MsgTimeoutOnClose],
	['/ibc.core.channel.v1.MsgAcknowledgement', MsgAcknowledgement],
	['/ibc.core.client.v1.MsgCreateClient', MsgCreateClient],
	['/ibc.core.client.v1.MsgUpdateClient', MsgUpdateClient],
	['/ibc.core.client.v1.MsgUpgradeClient', MsgUpgradeClient],
	['/ibc.core.client.v1.MsgSubmitMisbehaviour', MsgSubmitMisbehaviour],
	['/ibc.core.connection.v1.MsgConnectionOpenInit', MsgConnectionOpenInit],
	['/ibc.core.connection.v1.MsgConnectionOpenTry', MsgConnectionOpenTry],
	['/ibc.core.connection.v1.MsgConnectionOpenAck', MsgConnectionOpenAck],
	['/ibc.core.connection.v1.MsgConnectionOpenConfirm', MsgConnectionOpenConfirm],
];

class ExtendedRegistry extends Registry {
	decodeTx = (tx: Uint8Array): Tx => {
		return Tx.decode(tx);
	};
}

function createDefaultTypes(prefix: string): AminoConverters {
	return {
		...createAuthzAminoConverters(),
		...createBankAminoConverters(),
		...createDistributionAminoConverters(),
		...createGovAminoConverters(),
		...createStakingAminoConverters(prefix),
		...createIbcAminoConverters(),
		...createFreegrantAminoConverters(),
	};
}

export const CheqAminoRegistry = new AminoTypes(createDefaultTypes(CheqDenom));
export const CheqRegistry = new ExtendedRegistry(registryTypes);
