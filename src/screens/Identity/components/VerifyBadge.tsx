import React from 'react';
import { useTranslation } from 'react-i18next';
import Assets from 'assets';

import './VerifyBadge.scss';

type Props = {
	verified: VerificationState;
}

export enum VerificationState {
	Noop = "NO_OP",
	InProgress = 'IN_PROGRESS',
	Success = 'SUCCESS',
	Failed = 'FAILED'
}


const VerificationBadge: React.FC<Props> = ({ verified }): JSX.Element => {
	const { t } = useTranslation();
	if (verified === VerificationState.Success) {
		return (
			<div>
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
		<div>
			<div className='app-badge warning'>
				<p className="text warning">
					<img alt="checkmark" src={Assets.images.crossIcon} />{' '}
					{t('identity.credential.notVerified')}
				</p>
			</div>
		</div>
	);
};

export default VerificationBadge;
