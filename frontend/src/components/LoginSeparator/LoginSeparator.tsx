import './LoginSeparator.css';

interface Text {
	children : string
}

const LoginSeparator = ({children} : Text) => (
    <div className='LoginSeparator'>
      <div></div>
      <p>{children}</p>
      <div></div>
    </div>
)


export default LoginSeparator;
