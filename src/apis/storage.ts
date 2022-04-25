import axios from 'axios';

export interface LoadCryptoBoxResp<T> {
	cryptoBox: T;
}

export const backupCryptoBox = async <T>(accountId: string, data: T, authToken: string): Promise<void> => {
	await axios.post(
		process.env.REACT_APP_STORAGE_URL + '/api/credentials/cryptoBox',
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
		process.env.REACT_APP_STORAGE_URL + `/api/credentials/cryptoBox/${accountId}`,
		{
			headers: {
				Authorization: authToken,
			},
			validateStatus: (status) => status === 200 || status === 404,
		},
	);
	console.log(resp.status);

	if (resp.status === 404) {
		return null;
	}

	return resp.data.cryptoBox;
};
