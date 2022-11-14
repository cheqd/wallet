import axios from 'axios';
import { Credential } from '../models';

export const getCredential = async (subjectId: string, data: any, type: string, claim?: string): Promise<Credential> => {
	const resp = await axios.post<Credential>(import.meta.env.VITE_ISSUER_ENDPOINT + '/api/credentials/issue', {
		subjectId,
		claim,
		provider: 'twitter',
		data
	},
	{
		params: {
			type
		}
	});
	return resp.data;
};
