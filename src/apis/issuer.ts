import axios from 'axios';
import { Credential } from '../models';

export const getCredential = async (subjectId: string, claim: string, data: any, type: string): Promise<Credential> => {
	const resp = await axios.post<Credential>(import.meta.env.VITE_ISSUER_ENDPOINT + '/api/credentials/issue', {
		subjectId,
		claim,
		provider: 'twitter'
	},
	{
		params: {
			type,
			data
		}
	});
	return resp.data;
};
