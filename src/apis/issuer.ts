import axios from 'axios';
import { Credential } from '../models';
import { Claim } from 'redux/models/identity';

const getCredential = async (body: any, type: string): Promise<Credential> => {
	const resp = await axios.post<Credential>(import.meta.env.VITE_ISSUER_ENDPOINT + '/api/credentials/issue', body,
	{
		params: {
			type
		}
	});
	return resp.data;
};

export const getPersonCredential = async (subjectId: string, claim: Claim) => {
	return await getCredential({
		claim: claim.accessToken,
		subjectId,
		provider: claim.service
	},
	'Person'
	)
}

export const getTicketCredential = async (subjectId: string, data: string) => {
	return await getCredential({
		subjectId,
		data
	},
	'Ticket'
	)
}