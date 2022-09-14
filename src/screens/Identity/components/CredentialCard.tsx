import Assets from 'assets';
import axios from "axios";
import { Button as CustomButton, Card } from "components";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { trunc } from "utils";
import { Credential as VerifiableCredential } from '../../../models';
import CredentialVerificationBadge from "./VerifyBadge";

type Props = {
	cred: VerifiableCredential;
	handleShowCredential: (cred: VerifiableCredential) => void;
	handleRemoveCredential: (cred: VerifiableCredential) => void;
	key: string | number;
}

export enum CredentialVerificationState {
	Noop = "NO_OP",
	InProgress = 'IN_PROGRESS',
	Success = 'SUCCESS',
	Failed = 'FAILED'
}

const CredentialCard: React.FC<Props> = ({
	cred, key, handleRemoveCredential, handleShowCredential,
}): JSX.Element => {

	const { t } = useTranslation();
	const [state, setState] = useState<{ isVerified: CredentialVerificationState }>({
		isVerified: CredentialVerificationState.Noop,
	});


	const handleVerifyCredential = async (credential: VerifiableCredential) => {
		const uri = `${process.env.REACT_APP_ISSUER_ENDPOINT}/api/credentials/verify`;
		setState({ isVerified: CredentialVerificationState.InProgress })
		axios.post(uri, { credential }).then((resp: { data: { verified: boolean }, status: number }) => {
			if (resp.data.verified) {
				setState({ isVerified: CredentialVerificationState.Success })
				return
			}
			setState({ isVerified: CredentialVerificationState.Failed })
		}).catch((err: any) => {
			setState({ isVerified: CredentialVerificationState.Failed })
		})
	}

	return (
		<div className="col-lg-6 col-12" key={key}>
			<Card key={0} className="d-flex flex-column h-100 justify-content-between">
				<div>
					<div className="d-flex flex-row justify-content-between mb-2">
						<h2>
							<img
								src={Assets.images.cheqdRoundLogo}
								height="28"
								className="me-3"
							/>
							Credential
						</h2>
						<div className="d-flex align-items-center justify-content-center gap-2">
							{
								state.isVerified === CredentialVerificationState.Success ||
									state.isVerified === CredentialVerificationState.Failed ?
									<div className="outline d-flex flex-row align-items-center">
										<CredentialVerificationBadge verified={state.isVerified} />
									</div> :
									<CustomButton
										outline={true}
										onClick={() => handleVerifyCredential(cred)}
										isLoading={state.isVerified === CredentialVerificationState.InProgress}
									>
										Verify
									</CustomButton>
							}
						</div>
					</div>
					<>
						<p> <b>Type:</b> {cred.type.join(', ')} </p>
						<p> <b>Issuance Date: </b> {new Date(cred.issuanceDate).toUTCString()} </p>
						<p> <b>Issuer: </b> {trunc(cred.issuer.id, 17)} </p>
						{cred.name ? <p> <b>Name:</b> {cred.name} </p> : null}
						{
							cred.WebPage ? cred.WebPage.map((webpage) => {
								return (
									<p> <b>{webpage.description}:</b> {webpage.name} </p>
								)
							}) : null
						}
					</>

					<div className="d-flex flex-row align-items-right mt-4 mx-0">
						<div
							className="app-btn  app-btn-plain bg-transparent text-btn p-0 me-4 h-auto"
							onClick={async () =>
								await handleShowCredential(cred)
							}
						>
							{t('identity.credential.show')}
						</div>
						<div className="wrapper undefined">
							<div
								className="scale-anim undefined bg-transparent text-btn p-0 h-auto"
								onClick={async () =>
									await handleRemoveCredential(cred)
								}
							>
								{t('identity.credential.remove')}
							</div>
						</div>
					</div>
				</div>
			</Card>
		</div>
	)
}

export default CredentialCard;
