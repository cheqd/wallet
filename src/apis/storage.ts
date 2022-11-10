import axios, { AxiosError } from 'axios';

export type LoadCryptoBoxResp = {
	cryptoBox: string;
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

export const loadCryptoBox = async <T>(accountId: string, authToken: string): Promise<string | AxiosError> => {
	const cryptoBoxResp = axios.get(
		import.meta.env.VITE_STORAGE_ENDPOINT + `/api/authentication/cryptoBox/${accountId}`,
		{ headers: { Authorization: authToken, } },
	).then(resp => {
		return (resp.data as LoadCryptoBoxResp).cryptoBox
	}).catch((err: Error | AxiosError) => {
		if (axios.isAxiosError(err)) {
			return err
		}

		throw err;
	})

	return cryptoBoxResp;
};
