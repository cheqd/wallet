import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Credential as VerifiableCredential } from '../../../models';
import assets from 'assets';
import { trunc } from 'utils';
import { Card, Button as CustomButton } from 'components';

type CredentialHandler = (cred: VerifiableCredential) => Promise<void>;
type Props = {
	credential: VerifiableCredential;
	handleRemoveCredential: CredentialHandler;
	handleVerifyCredential: CredentialHandler;
	handleShowCredential: CredentialHandler;
	children: JSX.Element
}

const CredentialCard: React.FC<Props> = ({
	credential,
	handleShowCredential,
	handleRemoveCredential,
	handleVerifyCredential,
	children,
}): JSX.Element => {
	const { t } = useTranslation();
	const credentialDetailsRef = useRef<HTMLDivElement>(null);
	const [state, setState] = useState({
		isLoading: false,
		isVerified: false,
		error: '',
		isModalOpen: false,
	})

	const changeActiveTab = (activeTab: string) => {
		const tabs = ['tab-formatted', 'tab-json', 'tab-qr'];
		tabs.forEach((tab) => {
			const tabObj = document.getElementById(tab);
			if (tab === activeTab) {
				tabObj?.classList.add('active');
			} else {
				tabObj?.classList.remove('active');
			}
		});
	}

	const verifyCredential = async (cred: VerifiableCredential) => {
		setState({ ...state, isVerified: false, error: '', isLoading: true })
		console.log('state: ', state.isLoading);
		handleVerifyCredential(cred).then(resp => {
			setTimeout(() => {
				setState({ ...state, isLoading: false, isVerified: true })
			}, 2000)
			return
		}).catch(err => {
			setState({ ...state, isLoading: false, isVerified: false, error: (err as Error).message })
		})
	}

	return (
		<div className="col-lg-6 col-12">
			<Card className="d-flex flex-column h-100 justify-content-between">
				<div>
					<div className="d-flex flex-row justify-content-between mb-2">
						<h2>
							<img
								src={assets.images.cheqdRoundLogo}
								height="28"
								className="me-3"
							/>
							Credential
						</h2>
						<CustomButton
							onClick={() => verifyCredential(credential)}
							outline={true}
							isLoading={state.isLoading}
							disabled={state.isVerified}
						>
							{state.isVerified ?
								<div className="flex-row d-flex gap-2">
									Verified
									<img
										src={assets.images.checkmarkIcon}
										height="20"
									/>
								</div>
								: 'Verify'
							}
						</CustomButton>
					</div>
					<>
						<p>
							<b>Type:</b> {credential.type.join(', ')}
						</p>
						<p>
							<b>Issuance Date: </b>
							{new Date(credential.issuanceDate).toUTCString()}
						</p>
						<p>
							<b>Issuer: </b> {trunc(credential.issuer.id, 17)}
						</p>
						<p>
							<b>Name:</b> {credential.name}
						</p>
					</>
					{children}
				</div>
			</Card>
		</div>
	);
};

export default CredentialCard;
