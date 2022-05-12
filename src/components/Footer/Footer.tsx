import React from 'react';
import Assets from 'assets';
import { CHEQ_WALLET_GITHUB, CHEQ_DISCORD } from 'constant';

import './Footer.scss';

const Footer = (): JSX.Element => {
	return (
		<div className="d-flex w-100 justify-content-sm-end justify-content-center align-items-center flex-column flex-sm-row p-4">
			<div>
				<a href={CHEQ_WALLET_GITHUB} target="_blank" rel="noreferrer">
					<img src={Assets.images.githubIcon} className="footer-icon" />
				</a>
				<a href={CHEQ_DISCORD} target="_blank" rel="noreferrer" className="ms-4">
					<img src={Assets.images.discordIcon} className="footer-icon" />
				</a>
			</div>
		</div>
	);
};

export default Footer;
