import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch } from 'redux/store';
import { Button as FEButton } from '@cheqd/wallet-frontend-elements';
import { Input, SwitchInput, Button, HdPathInput, HoverTooltip } from 'components';

import { MnemonicLength, WalletUtils } from 'utils';
import assets from 'assets';
import { getCheqHdPath } from 'network';

const defaultMnemonicState: { length: MnemonicLength; values: string[] } = {
	length: 12,
	values: ['', '', '', '', '', '', '', '', '', '', '', ''],
};

const ImportMnemonicModal = (): JSX.Element => {
	// State
	const [mnemonic, setMnemonic] = useState(defaultMnemonicState);
	const [pasteHandled, setPasteHandled] = useState(false);
	const [showAdvanced, setShowAdvanced] = useState(false);

	const [customHdPath, setCustomHdPath] = useState(getCheqHdPath());
	const [isCustomPathValid, setIsCustomPathValid] = useState(true);

	/* CODE RELATED TO EXTRA WORD FOR FUTURE IMPLEMENTATION

	const [isExtraWord, setIsExtraWord] = useState(false);
	const [extraWord, setExtraWord] = useState(''); */

	// Redux hooks
	const { signInWithMnemonic } = useRematchDispatch((dispatch: RootDispatch) => ({
		signInWithMnemonic: dispatch.wallet.signInWithMnemonicAsync,
	}));

	// Utils hooks
	const { t } = useTranslation();

	// Methods
	const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (event) => {
		const text = event.clipboardData.getData('text/plain');
		const inputValues = text.split(' ');
		const valuesLength = inputValues.length;

		if (WalletUtils.checkMnemonicLength(valuesLength)) {
			setMnemonic({ values: inputValues, length: valuesLength });
			setPasteHandled(true);
		}
	};

	const onInputChange = (value: string, index: number) => {
		if (pasteHandled) {
			setPasteHandled(false);
		} else {
			const newValues = [...mnemonic.values];

			newValues[index] = value;

			setMnemonic({ values: newValues, length: mnemonic.length });
		}
	};

	const onLengthChange = (length: MnemonicLength) => {
		const inputs: string[] = [];

		for (let i = 0; i < length; i++) {
			inputs.push(mnemonic.values[i] || '');
		}

		setMnemonic({ values: inputs, length });
	};

	const onSubmit = () => {
		const mnemonicString = mnemonic.values.map((val) => val.trim()).join(' ');

		/*  CODE RELATED TO EXTRA WORD FOR FUTURE IMPLEMENTATION
		if (extraWord) {
			mnemonic += ' ' + extraWord;
		} */

		signInWithMnemonic({ mnemonic: mnemonicString, customHdPath });
	};

	const isEmptyField = () => {
		return mnemonic.values.findIndex((input) => input.length === 0) !== -1;
	};

	return (
		<>
			<div className="mb-4rem">
				<p className="not-recommended mb-2">{t('welcome.softwareModal.notRecommended')}</p>
				<h3 className="text-center">{t('welcome.softwareModal.importMnemonic')}</h3>
				<p className="auth-paragraph">{t('welcome.softwareModal.notRecommendedDescription')}</p>
			</div>
			<div className="d-flex flex-row align-self-stretch align-items-center justify-content-between mt-4rem">
				<div className="d-flex flex-row align-items-center">
					<SwitchInput
						id="mnemonicLength"
						offLabel="12"
						onLabel="24"
						checked={mnemonic.length === 24}
						onChange={(event) => onLengthChange(event.target.checked ? 24 : 12)}
					/>
					<h6>{t('common.values')}</h6>
				</div>
			</div>
			<div className="container-fluid py-4">
				<div className="row gy-4">
					{mnemonic.values.map((input, index) => (
						<div className="col-4" key={index}>
							<Input
								value={input}
								required
								onPaste={handlePaste}
								onChange={(event) => onInputChange(event.target.value, index)}
								inputStyle="default"
								name={`mnemonicInput${index}`}
								id={`mnemonicInput${index}`}
								type="form"
								autoComplete="off"
								label={`${(index + 1).toString()}.`}
								inputClass="border-0 mnemonic-input-import"
								className="border-bottom form-inline align-middle mt-4"
							/>
						</div>
					))}
				</div>
			</div>
			<div className="d-flex flex-row justify-content-between align-self-stretch align-items-center my-4">
				<p className="p-0 m-0">
					{t('common.advanced')}
					<span className="ms-2">
						<HoverTooltip text={t('common.advancedTooltip')}>
							<img src={assets.images.warningHoverIcon} />
						</HoverTooltip>
					</span>
				</p>
				<SwitchInput onChange={(event) => setShowAdvanced(event.target.checked)} />
			</div>
			{showAdvanced && (
				<div className="mb-4rem">
					<div className="d-flex flex-row justify-content-between align-items-center mb-3">
						<h4>{t('welcome.hardwareModal.advanced.title')}</h4>
						<FEButton
							onPress={() => {
								setCustomHdPath(getCheqHdPath());
							}}
							className="bg-transparent text-btn p-0 me-2 h-auto"
						>
							{t('common.reset')}
						</FEButton>
					</div>
					<HdPathInput
						value={customHdPath}
						onChange={(value) => setCustomHdPath(value)}
						onCheck={(valid) => setIsCustomPathValid(valid)}
					/>
				</div>
			)}
			{/* 
                // EXTRA WORD PART COMMENTED FOR NOW
                
            <div className="separator my-4 w-100"></div>
            <div className="d-flex flex-row justify-content-between align-self-stretch align-items-center my-4">
                <h5 className="p-0 m-0">Extra word</h5>
                <SwitchInput id="isExtraWord" onChange={(event) => setIsExtraWord(event.target.checked)} />
            </div>
            {isExtraWord && (
                <div className="mb-4rem">
                    <Input
                        ref={register}
                        value={extraWord}
                        name="extraWord"
                        required
                        onChange={(event) => setExtraWord(event.target.value)}
                        placeholder="Please enter at least 9 characters"
                        className="mb-3"
                    />
                    <p>
                        If you choose to include an extra word, understand you will ALWAYS need this extra
                        word with your mnemonic phrase. You can not change it. It becomes a permanent part
                        of your phrase.
                    </p>
                </div>
            )} */}
			<Button
				type="submit"
				onClick={onSubmit}
				data-bs-dismiss="modal"
				disabled={isEmptyField() || (showAdvanced && !isCustomPathValid)}
				className="mt-4 w-100"
			>
				{t('common.continue')}
			</Button>
		</>
	);
};

export default ImportMnemonicModal;
