import { createProtobufRpcClient, QueryClient } from '@cosmjs/stargate';
import { assert } from '@cosmjs/utils';
import { QueryClientImpl } from '@lum-network/sdk-javascript/build/codec/cosmos/bank/v1beta1/query';
import { Coin } from '@lum-network/sdk-javascript/build/types';

export interface BankExtension {
	readonly bank: {
		readonly balance: (address: string, denom: string) => Promise<Coin>;
		readonly allBalances: (address: string) => Promise<Coin[]>;
		readonly totalSupply: () => Promise<Coin[]>;
		readonly supplyOf: (denom: string) => Promise<Coin>;
	};
}

export function setupBankExtension(base: QueryClient): BankExtension {
	const rpc = createProtobufRpcClient(base);
	// Use this service to get easy typed access to query methods
	// This cannot be used for proof verification
	const queryService = new QueryClientImpl(rpc);

	return {
		bank: {
			balance: async (address: string, denom: string) => {
				const { balance } = await queryService.Balance({ address: address, denom: denom });
				assert(balance);
				return balance;
			},
			allBalances: async (address: string) => {
				const { balances } = await queryService.AllBalances({ address: address });
				return balances;
			},
			totalSupply: async () => {
				const { supply } = await queryService.TotalSupply({});
				return supply;
			},
			supplyOf: async (denom: string) => {
				const { amount } = await queryService.SupplyOf({ denom: denom });
				assert(amount);
				return amount;
			},
		},
	};
}
