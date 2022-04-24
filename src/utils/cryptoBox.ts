import { fromBase64, toBase64 } from '@lum-network/sdk-javascript/build/utils';

export const encrypt = async (data: Uint8Array, password: string): Promise<Uint8Array> => {
	const salt = window.crypto.getRandomValues(new Uint8Array(16));
	const key = await deriveAESGCMKey(password, salt);

	const iv = window.crypto.getRandomValues(new Uint8Array(12));
	const ciphertext = await window.crypto.subtle.encrypt(
		{
			name: 'AES-GCM',
			iv: iv,
		},
		key,
		data,
	);

	const textEncoder = new TextEncoder();
	const boxJson = JSON.stringify({
		iv: toBase64(iv),
		salt: toBase64(salt),
		ciphertext: toBase64(new Uint8Array(ciphertext)),
	});
	return textEncoder.encode(boxJson);
};

export const decrypt = async (boxBytes: Uint8Array, password: string): Promise<Uint8Array> => {
	const textDecoder = new TextDecoder();
	const boxJson = textDecoder.decode(boxBytes);
	const box = JSON.parse(boxJson);

	const key = await deriveAESGCMKey(password, fromBase64(box.salt));

	return await window.crypto.subtle.decrypt(
		{
			name: 'AES-GCM',
			iv: fromBase64(box.iv),
		},
		key,
		fromBase64(box.ciphertext),
	);
};

const deriveAESGCMKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
	const textEncoder = new TextEncoder();

	const passwordBuffer = textEncoder.encode(password);
	const importedKey = await window.crypto.subtle.importKey('raw', passwordBuffer, `PBKDF2`, false, ['deriveKey']);

	const derivationParams = { name: 'PBKDF2', hash: 'SHA-512', salt, iterations: 10000 };
	const keyParams = { name: 'AES-GCM', length: 256 };
	return await crypto.subtle.deriveKey(derivationParams, importedKey, keyParams, false, ['encrypt', 'decrypt']);
};
