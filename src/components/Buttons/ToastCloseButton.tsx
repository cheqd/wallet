import React from 'react';
import assets from 'assets';
import Button from './Button';

import './Buttons.scss';
import { CloseButtonProps } from 'react-toastify';

const ToastCloseButton = ({ closeToast }: CloseButtonProps) => (
	<Button onClick={closeToast} buttonType="custom" className="toast-close-btn rounded-circle p-2">
		<img src={assets.images.addIcon} width="20" height="20" />
	</Button>
);

export default ToastCloseButton;
