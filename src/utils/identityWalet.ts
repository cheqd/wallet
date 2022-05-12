import { decrypt, encrypt } from './cryptoBox';
import { IdentityWallet } from '../models';

export const encryptIdentityWallet = async (wallet: IdentityWallet, password: string): Promise<Uint8Array> => {
	const textEncoder = new TextEncoder();
	const walletBytes = textEncoder.encode(JSON.stringify(wallet));

	return await encrypt(walletBytes, password);
};

export const decryptIdentityWallet = async (buffer: Uint8Array, password: string): Promise<IdentityWallet> => {
	const decrypted = await decrypt(buffer, password);

	const textDecoder = new TextDecoder();
	return JSON.parse(textDecoder.decode(decrypted));
};

export const tryDecryptIdentityWallet = async (
	buffer: Uint8Array,
	password: string,
): Promise<IdentityWallet | null> => {
	try {
		return await decryptIdentityWallet(buffer, password);
	} catch (e) {
		return null;
	}
};
