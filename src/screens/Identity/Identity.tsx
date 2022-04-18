import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router';

import { Card } from 'frontend-elements';
import { Button as CustomButton } from 'components';
import { RootState } from 'redux/store';

import './styles/Identity.scss';
import { showErrorToast, showInfoToast } from 'utils';
import { getAuthToken } from '../../utils/walletAuth';

const Identity = (): JSX.Element => {
	// Redux hooks
	const { wallet } = useSelector((state: RootState) => ({
		wallet: state.wallet.currentWallet,
	}));

	// Utils hooks
	const { t } = useTranslation();

	if (!wallet) {
		return <Redirect to="/welcome" />;
	}

	// Methods
	const handleAuth = async () => {
		try {
			const authTokenBytes = await getAuthToken(wallet, process.env.ISSUER_URL);
			console.log(authTokenBytes);

			showInfoToast('Authorized');
		} catch (e) {
			showErrorToast((e as Error).message);
		}
	};

	return (
		<>
			<div className="mt-4">
				<div className="container">
					<div className="row gy-4">
						<div className="col-12">
							<Card className="d-flex flex-column h-100 justify-content-between">
								<div>
									<h2>{t('credentials.get.title')}</h2>
									<div className="my-4">{t('credentials.get.description')}</div>
								</div>
								<div className="d-flex flex-row justify-content-start">
									<CustomButton className="px-5" onClick={handleAuth}>
										{t('credentials.get.auth')}
									</CustomButton>
									<div className="mx-4">
										<CustomButton className="px-5">{t('credentials.get.get')}</CustomButton>
									</div>
								</div>
							</Card>
						</div>
						<div className="col-12">
							<Card className="d-flex flex-column h-100 justify-content-between">
								<div>
									<h2>{t('credentials.list.title')}</h2>
								</div>
								<div className="row gy-4 mt-0">
									<div className="col-lg-6 col-12">
										<Card className="d-flex flex-column h-100 justify-content-between">
											<div>
												<h2>Credential 1</h2>
											</div>
										</Card>
									</div>
									<div className="col-lg-6 col-12">
										<Card className="d-flex flex-column h-100 justify-content-between">
											<div>
												<h2>Credential 2</h2>
											</div>
										</Card>
									</div>
									<div className="col-lg-6 col-12">
										<Card className="d-flex flex-column h-100 justify-content-between">
											<div>
												<h2>Credential 3</h2>
											</div>
										</Card>
									</div>
									<div className="col-lg-6 col-12">
										<Card className="d-flex flex-column h-100 justify-content-between">
											<div>
												<h2>Credential 4</h2>
											</div>
										</Card>
									</div>
								</div>
								<div className="d-flex flex-row justify-content-start mt-4">
									<CustomButton className="px-5">{t('credentials.list.backup')}</CustomButton>
									<div className="mx-4">
										<CustomButton className="px-5">{t('credentials.list.restore')}</CustomButton>
									</div>
								</div>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Identity;
