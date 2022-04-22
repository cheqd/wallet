import Long from 'long';
import { Decimal, Uint64 } from '@cosmjs/math';
import { Coin, QueryClient } from '@cosmjs/stargate';

import { PageRequest } from '@lum-network/sdk-javascript/build/codec/cosmos/base/query/v1beta1/pagination';

export interface ProtobufRpcClient {
	request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}

export function createProtobufRpcClient(base: QueryClient): ProtobufRpcClient {
	return {
		request: (service: string, method: string, data: Uint8Array): Promise<Uint8Array> => {
			const path = `/${service}/${method}`;
			return base.queryUnverified(path, data);
		},
	};
}

export function createPagination(paginationKey?: Uint8Array): PageRequest | undefined {
	return paginationKey
		? {
				key: paginationKey,
				offset: Long.fromNumber(0, true),
				limit: Long.fromNumber(0, true),
				countTotal: false,
				reverse: false,
		  }
		: undefined;
}

export function longify(value: string | number | Long | Uint64): Long {
	const checkedValue = Uint64.fromString(value.toString());
	return Long.fromBytesBE([...checkedValue.toBytesBigEndian()], true);
}

export function convertCoin(from: string, to: string) {
	const amount = Decimal.fromAtomics(from, 9);

	return amount.toFloatApproximation();
}
