import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router';

import { Card } from 'frontend-elements';
import { Button as CustomButton } from 'components';
import { RootDispatch, RootState } from 'redux/store';

import './styles/Identity.scss';
import { showErrorToast, showInfoToast, showSuccessToast, trunc } from 'utils';
import { getAuthToken } from '../../utils/walletAuth';
import { toBase64 } from '@lum-network/sdk-javascript/build/utils';
import { getCredential } from '../../apis/issuer';
import { useRematchDispatch } from '../../redux/hooks';
import { encrypt } from '../../utils/cryptoBox';
import { backupCryptoBox } from '../../apis/storage';

const Identity = (): JSX.Element => {
	// Redux hooks
	const { wallet, identityWallet } = useSelector((state: RootState) => ({
		wallet: state.wallet.currentWallet,
		identityWallet: state.identity.wallet,
	}));

	// Dispatch methods
	const { addCredential, loadWallet, createNewWallet } = useRematchDispatch((dispatch: RootDispatch) => ({
		addCredential: dispatch.identity.addCredential,
		loadWallet: dispatch.identity.loadWallet,
		createNewWallet: dispatch.identity.createNewWallet,
	}));

	// Utils hooks
	const { t } = useTranslation();

	// Effects
	// useEffect(() => {
	// 	loadWallet().catch((e) => showErrorToast((e as Error).message));
	// }, [loadWallet]);

	if (!wallet) {
		return <Redirect to="/welcome" />;
	}

	// Methods
	const handleAuth = async () => {
		try {
			const authTokenBytes = await getAuthToken(wallet, process.env.REACT_APP_ISSUER_URL);
			console.log(toBase64(authTokenBytes));

			showInfoToast('Auth token generated');
		} catch (e) {
			showErrorToast((e as Error).message);
		}
	};

	const handleGetCredential = async () => {
		try {
			const cred = await getCredential();
			addCredential(cred);

			console.log('authBytes: ', toBase64(wallet.getPublicKey()));
			showSuccessToast('Credential added');
		} catch (e) {
			showErrorToast((e as Error).message);
		}
	};

	const handleLoadWallet = async () => {
		try {
			await loadWallet(wallet.getAddress());
			showSuccessToast('Wallet loaded');
		} catch (e) {
			showErrorToast((e as Error).message);
		}
	};

	const handleNewWallet = async () => {
		try {
			await createNewWallet();
			showSuccessToast('New wallet created');
		} catch (e) {
			showErrorToast((e as Error).message);
		}
	};

	const handleBackupWallet = async () => {
		try {
			if (identityWallet == null) {
				showErrorToast('No wallet to backup');
				return;
			}

			const textEncoder = new TextEncoder();
			const walletBytes = textEncoder.encode(JSON.stringify(identityWallet));

			const encrypted = await encrypt(walletBytes, 'password');
			await backupCryptoBox(wallet.getAddress(), toBase64(encrypted));
			showSuccessToast('Wallet backed up');
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
										<CustomButton className="px-5" onClick={handleGetCredential}>
											{t('credentials.get.get')}
										</CustomButton>
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
									{identityWallet?.credentials.map((cred) => {
										return (
											<div className="col-lg-6 col-12" key={cred.id}>
												<Card className="d-flex flex-column h-100 justify-content-between">
													<div>
														<h2>Credential</h2>
														<p>Id: {trunc(cred.id, 15)}</p>
														<p>Issuer: {cred.issuer}</p>
														<p>Subject: {cred.credentialSubject.id}</p>
														<p>Twitter: {cred.credentialSubject.twitter_handle}</p>
													</div>
												</Card>
											</div>
										);
									})}
								</div>
								<div className="d-flex flex-row justify-content-start mt-4">
									<CustomButton className="px-5" onClick={handleBackupWallet}>
										{t('credentials.list.backup')}
									</CustomButton>
									<div className="mx-4">
										<CustomButton className="px-5" onClick={handleLoadWallet}>
											{t('credentials.list.load')}
										</CustomButton>
									</div>
									<div>
										<CustomButton className="px-5" onClick={handleNewWallet}>
											{t('credentials.list.new')}
										</CustomButton>
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
