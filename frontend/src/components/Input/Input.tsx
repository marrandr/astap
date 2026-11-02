import './Input.css';
import { useState, type MouseEventHandler } from 'react';
import Shown from '../../assets/shown.png';
import Hidden from "../../assets/hidden.png";


interface InputProps {
	name : string;
	children : string;
	type : string;
	holder: string
	icon: string | null;
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

const Input = ({name, children, type, holder, icon = null} : InputProps) => {

	const [passwd, setPasswd] = useState<string>(type);
	const [srcs, setSrcs] = useState<string>(Shown);

	const changePasswd = () => {
		
		if (passwd == 'password') {

			setSrcs(Hidden);
			setPasswd('text');
		} else {

			setSrcs(Shown);
			setPasswd('password');
		}
	}

	return (
    	<div className='Input'>
    		<label htmlFor={name}>{ children }</label>
			<div>
				{icon != null && <span className='left'>{ <ShowPassword source={icon} size={30} click={null} /> }</span> }
				<input type={passwd} id={name} name={name} placeholder={ holder } />
				{type == 'password' && <span className='right'>{
					<ShowPassword source={srcs} size={30} click={changePasswd} />
				}</span>}
			</div>
		</div>
	)
}

export default Input;
