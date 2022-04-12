import { QueryClient, createProtobufRpcClient } from '@cosmjs/stargate';
import { QueryClientImpl } from '@lum-network/sdk-javascript/build/codec/cosmos/auth/v1beta1/query';
import { Any } from '@lum-network/sdk-javascript/build/codec/google/protobuf/any';

export interface AuthExtension {
	readonly auth: {
		readonly account: (address: string) => Promise<Any | null>;
	};
}

export function setupAuthExtension(base: QueryClient): AuthExtension {
	const rpc = createProtobufRpcClient(base);
	const queryService = new QueryClientImpl(rpc);

	return {
		auth: {
			account: async (address: string) => {
				const { account } = await queryService.Account({ address: address });
				return account ?? null;
			},
		},
	};
}
