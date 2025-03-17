import { useNavigate } from "react-router-dom"
import { assets } from "../assets/assets"
import { useContext, useState } from "react"
import { AppContext } from "../context/AppContext";
import axios from 'axios' ;
import { toast } from "react-toastify";



const Login = () => {

  const navigate = useNavigate();

  const { backendUrl , setIsLoggedIn , getUserData} = useContext(AppContext) ;  

  const [state , setState ] = useState('Sign Up')
  const [ name , setName ] = useState('')
  const [ email , setEmail ] = useState('')
  const [ password , setPassword ] = useState('')

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();

      axios.defaults.withCredentials = true ;
      if(state === 'Sign Up'){
       const { data } =  await axios.post(backendUrl + '/api/auth/register' , { name , email , password }) ;

       
       
        if(data.success){
          setIsLoggedIn(true)
          getUserData()
          navigate('/')
        }else{
          toast.error(data.message)
        }        
      } else {
        const { data } =  await axios.post(backendUrl + '/api/auth/login' , { email , password }) ;
        
        if(data.success){
          setIsLoggedIn(true)
          getUserData()
          navigate('/')
        }else{
          toast.error(data.message)
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <div className="flex justify-center items-center gap-2 min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
     <img onClick={ () => navigate('/')} src={assets.logo} className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer" />
     <div className="w-full sm:w-96 bg-slate-900 rounded-lg p-10 shadow-lg text-sm text-indigo-300">
     
     <form onSubmit={onSubmitHandler}>
        <h2 className="text-3xl text-center mb-3 text-white font-semibold">{ state === 'Sign Up' ? 'Create Account' : 'Login '}</h2>
        <p className="text-center mb-6 text-sm">{ state === 'Sign Up' ? 'Create your account' : 'Login to your account!'}</p>

        {state === 'Sign Up' && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.person_icon} alt="" />
              <input  
                onChange={e => setName(e.target.value)}
                value={name}
                className="bg-transparent outline-none" type="text" placeholder="Full Name" required />
            </div> 
        )}
      
        <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" />
            <input 
              onChange={e => setEmail(e.target.value)}
              value={email}        
            className="bg-transparent outline-none" type="email" placeholder="Email id" required />
          </div>

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" />
            <input 
              onChange={e => setPassword(e.target.value)}
              value={password}
            className="bg-transparent outline-none" type="password" placeholder="Passsword" required />
          </div>

        <p onClick={() => navigate('/reset-password')}className="text-indigo-500 mb-4 cursor-pointer">Forgot Password?</p>

        <button className="py-2.5 font-medium text-white rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 w-full">
          {state}
        </button>
      </form>
        
      

      {state === 'Sign Up' ? (
        <p className="text-gray-400 mt-4 text-xs">Already have an account?{' '} 
          <span onClick={() => setState('Login')} className="underline text-blue-400 cursor-pointer">Login here</span>
        </p>
        ) : (
        <p onClick={() => setState('Sign Up')} className="text-gray-400 mt-4 text-xs">Don't have an account?{' '} 
          <span className="underline text-blue-400 cursor-pointer">Sign Up</span>
        </p>
      ) }
      

        
      
     </div>
    </div>
  )
}

export default Login
