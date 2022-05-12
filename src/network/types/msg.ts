import { Message } from '@lum-network/sdk-javascript/build/messages';
import { Fee } from '@lum-network/sdk-javascript/build/types/Fee';

export interface Doc {
	/**
	 * chain_id is the unique identifier of the chain this transaction targets.
	 * It prevents signed transactions from being used on another chain by an
	 * attacker
	 */
	chainId: string;
	/**
	 * Transaction requested Fee
	 */
	fee: Fee;
	/**
	 * Transaction memo
	 */
	memo?: string;
	/**
	 * Transactions messages
	 */
	messages: Message[];
	/**
	 * Transction auth signers
	 */
	signers: DocSigner[];
}

export interface DocSigner {
	/** the account number of the account in state */
	accountNumber: number;
	/** current account sequence */
	sequence: number;
	/** account public key */
	publicKey: Uint8Array;
}
