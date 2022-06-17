import React from 'react';
import { useTranslation } from 'react-i18next';
import Assets from 'assets';

import './VerifyBadge.scss';
import { CredentialVerificationState } from './CredentialCard';

type Props = {
	verified: CredentialVerificationState;
}

const CredentialVerificatinBadge: React.FC<Props> = ({ verified }): JSX.Element => {
	const { t } = useTranslation();
	if (verified === CredentialVerificationState.Success) {
		return (
			<div className="">
				<div className={`app-badge success`}>
					<p className="text success">
						<img alt="checkmark" src={Assets.images.checkmarkIcon} />{' '}
						{t('identity.credential.verified')}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="">
			<div className='app-badge warning'>
				<p className="text warning">
					<img alt="checkmark" src={Assets.images.crossIcon} />{' '}
					{t('identity.credential.notVerified')}
				</p>
			</div>
		</div>
	);
};

export default CredentialVerificatinBadge;
