import './Input.css';
import { useState, type MouseEventHandler } from 'react';
import Shown from '../../assets/shown.png';
import Hidden from "../../assets/hidden.png";


interface InputProps {
	name : string;
	children : string;
	type : string;
	holder: string
}

interface ShowPasswordProps {
	source : string;
	click : MouseEventHandler;
	size: number;
}

const ShowPassword = ({source, click, size} : ShowPasswordProps) => {

	return (
		<img onClick={ click } src={ source } alt='' width={size} height={size} />
	)
}

const Input = ({name, children, type, holder} : InputProps) => {

	const [passwd, setPasswd] = useState<string>(type);
	const [srcs, setSrcs] = useState<string>(Shown);

	const changePasswd = () => {
		
		if (passwd == 'password') {

			setSrcs(Hidden);
			setPasswd('text');
		} else {

			setSrcs(Shown);
			setPasswd('password')
		}
	}

	const showPassword = type == 'password' ? <ShowPassword source={srcs} size={30} click={changePasswd} /> : <></>;

	return (
    	<div className='Input'>
    		<label htmlFor={name}>{ children }</label>
			<div>
				<input type={passwd} id={name} name={name} placeholder={ holder } />
				<span>{ showPassword }</span>
			</div>
		</div>
	)
}

export default Input;
