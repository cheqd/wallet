import { useDispatch } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';

export const useRematchDispatch = <D extends Dispatch<AnyAction>, MD>(selector: (dispatch: D) => MD): MD => {
	const dispatch = useDispatch<D>();
	return selector(dispatch)
}

// export const useRematchDispatch = <D extends Record<string, unknown>, MD>(selector: (dispatch: D) => MD): MD => {
// 	const dispatch = useDispatch<D>();
// 	return selector(dispatch);
// };
