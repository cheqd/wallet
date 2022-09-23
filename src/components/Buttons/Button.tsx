import { Loading } from '@jsdp/frontend-elements';
import React from 'react';

import './Buttons.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	buttonType?: 'custom' | 'normal';
	isLoading?: boolean;
	outline?: boolean;
	noScale?: boolean;
}

const Button = (props: ButtonProps): JSX.Element => {
	const { children, className, noScale, isLoading, outline, buttonType = 'normal', ...rest } = props;
	let normalButtonClasses = 'normal-btn scale-anim d-flex gap-2 justify-content-center align-items-center px-5 py-2 rounded-pill';

	return (
		<button
			{...rest}
			className={`${buttonType === 'normal'
				? normalButtonClasses
				: 'scale-anim'
				} ${outline && 'outline'} ${className}`}
		>
			{isLoading ? <Loading /> : children}
		</button>
	);
};

export default Button;
