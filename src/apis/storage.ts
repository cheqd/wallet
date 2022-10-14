import axios from 'axios';

export interface LoadCryptoBoxResp<T> {
	cryptoBox: T;
}

export const backupCryptoBox = async <T>(accountId: string, data: T, authToken: string): Promise<void> => {
	await axios.post(
		import.meta.env.VITE_STORAGE_ENDPOINT + '/api/authentication/cryptoBox',
		{
			accountID: accountId,
			cryptoBox: data,
		},
		{
			headers: {
				Authorization: authToken,
			},
		},
	);
};

export const loadCryptoBox = async <T>(accountId: string, authToken: string): Promise<T | null> => {
	const resp = await axios.get<LoadCryptoBoxResp<T>>(
		import.meta.env.VITE_STORAGE_ENDPOINT + `/api/authentication/cryptoBox/${accountId}`,
		// process.env.VITE_STORAGE_ENDPOINT + `/api/authentication/cryptoBox/${accountId}`,
		{
			headers: {
				Authorization: authToken,
			},
			validateStatus: (status) => status === 200 || status === 400,
		},
	);
	console.log(resp.status);

	if (resp.status === 400) {
		return null;
	}

	return resp.data.cryptoBox;
};
