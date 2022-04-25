import {
	Tendermint34Client,
	StatusResponse,
	TxResponse,
	TxSearchParams,
	BroadcastTxCommitResponse,
	BlockResponse,
	broadcastTxCommitSuccess,
} from '@cosmjs/tendermint-rpc';
import {
	QueryClient as StargateQueryClient,
	assertIsDeliverTxSuccess,
	SigningStargateClient,
	StargateClient,
	DeliverTxResponse,
	StdFee,
	calculateFee,
} from '@cosmjs/stargate';

import {
	Coin,
	// BlockResponse,
	Account,
	// TxResponse,
	// BroadcastTxCommitResponse,
	SignDoc,
	// TxSearchParams,
} from '@lum-network/sdk-javascript/build/types';

import { Doc, DocSigner } from './types/msg';
import {
	// AuthExtension,
	// setupAuthExtension,
	BankExtension,
	setupBankExtension,
	TxExtension,
	setupTxExtension,
	// GovExtension,
	// setupGovExtension,
} from './modules';
import { LumUtils } from '@lum-network/sdk-javascript';
import { CheqWallet } from './wallet';

import {
	StakingExtension,
	AuthExtension,
	setupAuthExtension,
	setupStakingExtension,
	DistributionExtension,
	setupDistributionExtension,
	GovExtension,
	setupGovExtension,
} from '@cosmjs/stargate/build/modules';
import { DirectSecp256k1HdWallet, EncodeObject } from '@cosmjs/proto-signing';
import { Fee } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { NanoCheqDenom } from './constants';
import { Message } from '@lum-network/sdk-javascript/build/messages';
import { toHex } from '@cosmjs/encoding';

export class CheqClient {
	readonly tmClient: Tendermint34Client;
	protected stargateSigninClient: SigningStargateClient | undefined;
	readonly queryClient: StargateQueryClient &
		AuthExtension &
		BankExtension &
		GovExtension &
		StakingExtension &
		DistributionExtension &
		TxExtension;
	private chainId?: string;

	/**
	 * Create a CheqClient instance using a tendermint RPC client
	 *
	 * @param tmClient tendermint RPC client
	 */
	constructor(tmClient: Tendermint34Client) {
		this.tmClient = tmClient;
		this.queryClient = StargateQueryClient.withExtensions(
			tmClient,
			setupAuthExtension,
			setupBankExtension,
			setupTxExtension,
			setupGovExtension,
			setupDistributionExtension,
			setupStakingExtension,
		);
		// Used for debugging while gasWanted, gasUsed and codespace are still waiting to be included in the code lib
		// // @ts-ignore
		// this.tmClient.r.decodeTx = (data) => {
		//     const res = adaptor34.responses.decodeTx(data);
		//     if (res && res.result) {
		//         // @ts-ignore
		//         res.result.gasWanted = Int53.fromString(data.result.tx_result.gas_wanted || '0').toNumber();
		//         // @ts-ignore
		//         res.result.gasUsed = Int53.fromString(data.result.tx_result.gas_used || '0').toNumber();
		//         // @ts-ignore
		//         res.result.codespace = data.result.tx_result.codespace;
		//     }
		//     return res;
		// };
	}

	/**
	 * Creates a new LumClient for the given endpoint
	 * Uses HTTP when the URL schema is http or https, uses WebSockets otherwise
	 *
	 * @param endpoint Blockchain node RPC url
	 */
	static connect = async (endpoint: string): Promise<CheqClient> => {
		const tmClient = await Tendermint34Client.connect(endpoint);
		return new CheqClient(tmClient);
	};

	withStargateSigninClient = (client: SigningStargateClient) => {
		this.stargateSigninClient = client;
	};

	/**
	 * Disconnect the underlying tendermint client
	 */
	disconnect() {
		// Temporary fix missing stop calls from the cosmjs socket implementation
		// @ts-ignore
		this.tmClient.client &&
			// @ts-ignore
			this.tmClient.client.socket &&
			// @ts-ignore
			this.tmClient.client.events &&
			// @ts-ignore
			this.tmClient.client.socket.events._stopNow();
		// @ts-ignore
		this.tmClient.client &&
			// @ts-ignore
			this.tmClient.client.socket &&
			// @ts-ignore
			this.tmClient.client.socket.connectionStatus &&
			// @ts-ignore
			this.tmClient.client.socket.connectionStatus.updates &&
			// @ts-ignore
			this.tmClient.client.socket.connectionStatus.updates._stopNow();

		// Disconnect the client
		this.tmClient.disconnect();
	}

	/**
	 * Get the connected node status information
	 */
	status = async (): Promise<StatusResponse> => {
		const status = await this.tmClient.status();
		return status;
	};

	/**
	 * Get the chain id
	 */
	getChainId = async (): Promise<string> => {
		if (!this.chainId) {
			const response = await this.tmClient.status();
			const chainId = response.nodeInfo.network;
			if (!chainId) {
				throw new Error('Chain ID must not be empty');
			}
			this.chainId = chainId;
		}
		return this.chainId;
	};

	/**
	 * Get the current block height
	 */
	getBlockHeight = async (): Promise<number> => {
		const status = await this.tmClient.status();
		return status.syncInfo.latestBlockHeight;
	};

	/**
	 * Get a block by height
	 *
	 * @param height block height to get (default to current height)
	 */
	getBlock = async (height?: number): Promise<BlockResponse> => {
		const response = await this.tmClient.block(height);
		return response as BlockResponse;
	};

	/**
	 * Get account information
	 *
	 * @param address wallet address
	 */
	getAccount = async (address: string): Promise<Account | null> => {
		const anyAccount = await this.queryClient.auth.account(address);
		if (!anyAccount) {
			return null;
		}
		return LumUtils.accountFromAny(anyAccount);
	};

	/**
	 * Get account balance
	 *
	 * @param address wallet address
	 * @param searchDenom Coin denomination (ex: lum)
	 */
	getBalance = async (address: string, searchDenom: string): Promise<Coin | null> => {
		const balance = await this.queryClient.bank.balance(address, searchDenom);
		return balance ? balance : null;
	};

	/**
	 * Get all account balances
	 *
	 * @param address wallet address
	 */
	getAllBalances = async (address: string): Promise<Coin[]> => {
		const balances = await this.queryClient.bank.allBalances(address);
		return balances;
	};

	/**
	 * Get coin supply
	 *
	 * @param searchDenom Coin denomination (ex: lum)
	 */
	getSupply = async (searchDenom: string): Promise<Coin | null> => {
		const supply = await this.queryClient.bank.supplyOf(searchDenom);
		return supply ? supply : null;
	};

	/**
	 * Get all coins supplies
	 */
	getAllSupplies = async (): Promise<Coin[]> => {
		const supplies = await this.queryClient.bank.totalSupply();
		return supplies;
	};

	/**
	 * Get a transaction by Hash
	 *
	 * @param hash transaction hash to retrieve
	 * @param includeProof whether or not to include proof of the transaction inclusion in the block
	 */
	getTx = async (hash: Uint8Array, includeProof?: boolean): Promise<TxResponse | null> => {
		const result = await this.tmClient.tx({ hash: hash, prove: includeProof });
		return result;
	};

	/**
	 * Search for transactions (paginated)
	 * All queries will be run and results will be deduplicated, merged and sorted by block height
	 *
	 * Queries:
	 * To tell which events you want, you need to provide a query. query is a string, which has a
	 * form: "condition AND condition ..." (no OR at the moment). condition has a form: "key operation operand".
	 * key is a string with a restricted set of possible symbols ( \t\n\r\()"'=>< are not allowed). operation can be
	 * "=", "<", "<=", ">", ">=", "CONTAINS" AND "EXISTS". operand can be a string (escaped with single quotes),
	 * number, date or time.
	 * Examples: tm.event = 'NewBlock' # new blocks tm.event = 'CompleteProposal' # node got a complete proposal
	 * tm.event = 'Tx' AND tx.hash = 'XYZ' # single transaction tm.event = 'Tx' AND tx.height = 5 # all txs of the
	 * fifth block tx.height = 5 # all txs of the fifth block
	 * Tendermint provides a few predefined keys: tm.event, tx.hash and tx.height. Note for transactions, you can define
	 * additional keys by providing events with DeliverTx response.
	 *
	 *
	 * @param queries queries to run (see utils/search for helpers)
	 * @param page page to query (default to 1)
	 * @param perPage results per pages (default to 30)
	 * @param includeProof whether or not to include proofs of the transactions inclusion in the block
	 */
	searchTx = async (queries: string[], page = 1, perPage = 30, includeProof?: boolean): Promise<TxResponse[]> => {
		const results = await Promise.all(
			queries.map((q) => this.txsQuery({ query: q, page: page, per_page: perPage, prove: includeProof })),
		);
		const seenHashes: Uint8Array[] = [];
		const uniqueResults: TxResponse[] = [];
		for (let r = 0; r < results.length; r++) {
			for (let t = 0; t < results[r].length; t++) {
				const tx = results[r][t];
				if (!seenHashes.includes(tx.hash)) {
					seenHashes.push(tx.hash);
					uniqueResults.push(results[r][t]);
				}
			}
		}
		return uniqueResults.sort((a, b) => a.height - b.height);
	};

	/**
	 * Run a tx search
	 *
	 * @param params Search params
	 */
	private txsQuery = async (params: TxSearchParams): Promise<readonly TxResponse[]> => {
		const results = await this.tmClient.txSearch(params);
		return results.txs;
	};

	/**
	 * Signs the messages using the provided wallet and builds the transaction
	 *
	 * @param wallet signing wallet or wallets for multi signature
	 * @param doc document to sign
	 */
	signTx = async (wallet: CheqWallet | CheqWallet[], doc: Doc): Promise<Uint8Array> => {
		let wallets: CheqWallet[] = [];
		if (Array.isArray(wallet)) {
			wallets = wallet;
		} else {
			wallets = [wallet];
		}

		if (wallets.length < 1) {
			throw new Error('At least one wallet is required to sign the transaction');
		}

		let signDoc: SignDoc | undefined = undefined;
		const signatures: Uint8Array[] = [];

		for (let i = 0; i < wallets.length; i++) {
			const account = await this.getAccount(wallets[i].getAddress());
			if (!account) {
				throw new Error(`Account not found for wallet at index ${i}`);
			}

			const [walletSignedDoc, signature] = await wallets[i].signTransaction(doc);
			if (i === 0) {
				signDoc = walletSignedDoc;
			}
			signatures.push(signature);
		}
		if (!signDoc) {
			throw new Error('Impossible error to avoid typescript warnings');
		}

		return LumUtils.generateTxBytes(signDoc, signatures);
	};

	/**
	 * Broadcast a signed transaction
	 * Basic usage would be to use the signTx method prior to calling this method
	 *
	 * @param tx signed transaction to broadcast
	 */
	broadcastTx = async (tx: Uint8Array): Promise<BroadcastTxCommitResponse> => {
		const response = await this.tmClient.broadcastTxCommit({ tx });
		return response;
	};

	/**
	 * Signs and broadcast the transaction using the specified wallet and messages
	 *
	 * @param wallet signing wallet or wallets for multi signature
	 * @param doc document to sign and broadcast as a transaction
	 */
	//     const signedTx = await this.signTx(wallet, doc);
	signAndBroadcastTx = async (
		wallet: CheqWallet,
		txnMsgs: EncodeObject[],
		fee: number | StdFee | 'auto',
		memo: string,
	): Promise<DeliverTxResponse> => {
		// if stargateSigninClient is present, try with that;
		if (this.stargateSigninClient) {
			try {
				// @ts-ignore
				const result = await this.stargateSigninClient.signAndBroadcast(
					wallet.getAddress(),
					txnMsgs,
					fee,
					memo,
				);
				return result;
			} catch (err: any) {
				throw new Error(err);
			}
		}

		const result = await this.getAccount(wallet.getAddress());
		if (!result) {
			throw new Error('error getting account');
		}

		const chainId = await this.getChainId();

		const gas = 180000;
		const doc: Doc = {
			messages: [],
			chainId: chainId,
			memo: memo,
			fee: {
				amount: [{ denom: NanoCheqDenom, amount: '2000000' }],
				gas: gas.toString(),
			},
			signers: [
				{
					sequence: result.sequence,
					accountNumber: result.accountNumber,
					publicKey: wallet.getPublicKey(),
				},
			],
		};

		txnMsgs.forEach(async (tm) => {
			doc.messages.push(tm);
		});

		const bz = await this.signTx(wallet, doc);
		const resp = await this.broadcastTx(bz);
		broadcastTxCommitSuccess(resp);
		const buildResp: DeliverTxResponse = {
			transactionHash: toHex(Uint8Array.from(resp.hash)),
			// @ts-ignore
			code: resp.deliverTx.code,
			height: resp.height,
			// @ts-ignore
			data: resp.deliverTx?.data,
			// @ts-ignore
			rawLog: resp.deliverTx?.log,
		};
		return buildResp;
	};
}
