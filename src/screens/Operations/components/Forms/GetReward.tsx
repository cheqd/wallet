import { Input, Button as CustomButton } from 'components';
import { FormikContextType } from 'formik';
import { Button } from '@cheqd/wallet-frontend-elements';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
	isLoading: boolean;
	form: FormikContextType<{
		amount: string;
		memo: string;
		address: string;
	}>;
}

const GetReward = ({ form, isLoading }: Props): JSX.Element => {
	const [confirming, setConfirming] = useState(false);

	const { t } = useTranslation();

	return (
		<>
			{confirming && <h6 className="mt-3">{t('operations.confirmation')}</h6>}
			<form className="row w-100 align-items-start text-start mt-3">
				<div className="col-12 mt-4">
					<Input
						{...form.getFieldProps('address')}
						readOnly={confirming}
						placeholder={t('operations.inputs.validator.label')}
						label={t('operations.inputs.validator.label')}
					/>
					{form.touched.address && form.errors.address && (
						<p className="ms-2 color-error">{form.errors.address}</p>
					)}
				</div>
				<div className="col-12 mt-4">
					{(!confirming || (confirming && form.values.memo)) && (
						<Input
							{...form.getFieldProps('memo')}
							readOnly={confirming}
							placeholder={t('operations.inputs.memo.placeholder')}
							label={t('operations.inputs.memo.label')}
						/>
					)}
					{form.touched.memo && form.errors.memo && <p className="ms-2 color-error">{form.errors.memo}</p>}
				</div>
				<div className="justify-content-center mt-4 col-10 offset-1 col-sm-6 offset-sm-3">
					<Button loading={isLoading} onPress={confirming ? form.handleSubmit : () => setConfirming(true)}>
						{confirming ? t('operations.types.getRewards.name') : t('common.continue')}
					</Button>
					{confirming && (
						<CustomButton
							className="bg-transparent text-btn mt-2 mx-auto"
							onClick={() => {
								setConfirming(false);
							}}
						>
							{t('operations.modify')}
						</CustomButton>
					)}
				</div>
			</form>
		</>
	);
};

export default GetReward;
