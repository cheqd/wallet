import { Window, KeplrIntereactionOptions } from '@keplr-wallet/types';

export class KeplrHelper {
	public isInstalled: boolean;

	constructor() {
		this.isInstalled = (window as Window).keplr !== undefined;
	}

	checkWalletIsInstalled(): void {
		if (!this.isInstalled) {
			throw new Error('wallet is not installed');
		}
	}

	get defaultOptions(): KeplrIntereactionOptions {
		this.checkWalletIsInstalled();
		return (window as Window).keplr!.defaultOptions;
	}

	set defaultOptions(options: KeplrIntereactionOptions) {
		this.checkWalletIsInstalled();
		(window as Window).keplr!.defaultOptions = options;
	}
}
