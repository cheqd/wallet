import { QueryClient } from '@cosmjs/stargate';
//import AuthModule from '@cosmjs/stargate/build/modules/auth';
//import { Any } from '../google/protobuf/any';
//import { createProtobufRpcClient } from 'network/util';

//export interface AuthExtension {
//	readonly auth: {
//		readonly account: (address: string) => Promise<Any | null>;
//	};
//}

//export function setupAuthExtension(base: QueryClient): AuthExtension {
//	const rpc = createProtobufRpcClient(base);
//	const queryService = new QueryClientImpl(rpc);
//	//@ts-ignore
//	// const enableDevTools = window.__GRPCWEB_DEVTOOLS__;
//	// enableDevTools([queryService]);
//	//

//	return {
//		auth: {
//			account: async (address: string) => {
//				const { account } = await queryService.Account({ address: address });
//				return account ?? null;
//			},
//		},
//	};
//}
