import Long from 'long';
import { createProtobufRpcClient, QueryClient } from '@cosmjs/stargate';

import { SignMode } from '@lum-network/sdk-javascript/build/codec/cosmos/tx/signing/v1beta1/signing';
import {
	GetTxRequest,
	GetTxResponse,
	ServiceClientImpl,
	SimulateRequest,
	SimulateResponse,
} from '@lum-network/sdk-javascript/build/codec/cosmos/tx/v1beta1/service';
import { AuthInfo, Fee, Tx, TxBody } from '@lum-network/sdk-javascript/build/codec/cosmos/tx/v1beta1/tx';
import { Message } from '@lum-network/sdk-javascript/build/messages';
import { CheqRegistry } from './registry';
import { publicKeyToProto } from '@lum-network/sdk-javascript/build/utils';

export interface TxExtension {
	readonly tx: {
		getTx: (txId: string) => Promise<GetTxResponse>;
		simulate: (
			messages: readonly Message[],
			memo: string | undefined,
			pubkey: Uint8Array,
			sequence: number,
		) => Promise<SimulateResponse>;
	};
}

export function setupTxExtension(base: QueryClient): TxExtension {
	// Use this service to get easy typed access to query methods
	// This cannot be used for proof verification
	const rpc = createProtobufRpcClient(base);
	const queryService = new ServiceClientImpl(rpc);

	return {
		tx: {
			getTx: async (hash: string) => {
				const request: GetTxRequest = {
					hash,
				};
				const response = await queryService.GetTx(request);
				return response;
			},
			simulate: async (
				messages: readonly Message[],
				memo: string | undefined,
				pubkey: Uint8Array,
				sequence: number,
			) => {
				const request = SimulateRequest.fromPartial({
					tx: Tx.fromPartial({
						authInfo: AuthInfo.fromPartial({
							fee: Fee.fromPartial({}),
							signerInfos: [
								{
									publicKey: publicKeyToProto(pubkey),
									sequence: Long.fromNumber(sequence, true),
									modeInfo: { single: { mode: SignMode.SIGN_MODE_UNSPECIFIED } },
								},
							],
						}),
						body: TxBody.fromPartial({
							messages: messages.map((m) => {
								return { typeUrl: m.typeUrl, value: CheqRegistry.encode(m) };
							}),
							memo: memo,
						}),
						signatures: [new Uint8Array()],
					}),
					// Sending serialized `txBytes` is the future. But
					// this is not available in Comsos SDK 0.42.
					txBytes: undefined,
				});
				const response = await queryService.Simulate(request);
				return response;
			},
		},
	};
}
