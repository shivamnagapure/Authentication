import React, { useContext, useEffect } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

const EmailVerify = () => {
  const navigate = useNavigate() ;

  const inputRefs = React.useRef([])

  const { backendUrl , getUserData , isLoggedIn , userData } = useContext(AppContext);
  
  

  const handleInput = (e , index) => {
    if(e.target.value.length > 0 && index < inputRefs.current.length - 1){
      inputRefs.current[index + 1].focus();
    }   
  }

  const handleKeyDown = ( e , index) => {
    if(e.key === 'Backspace' && e.target.value === '' && index > 0){
      inputRefs.current[index - 1].focus();
    }
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text')
    const pasteArray = paste.split('')
    pasteArray.forEach( ( char , index ) => {
      if(inputRefs.current[index]){
        inputRefs.current[index].value = char
      }
    });
  }

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      axios.defaults.withCredentials = true

      const otpArray = inputRefs.current.map( (e) => e.value ) //map iterate through inputRefs array and create new array ["1", "2", "3", "4"]
      const otp = otpArray.join('')

      const { data } = await axios.post(backendUrl + '/api/auth/verify-account' , {otp} )

      if(data.success){
        toast.success(data.message)
        getUserData()
        navigate('/')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    isLoggedIn && userData && userData.isAccountVerified && navigate('/')
  } , [isLoggedIn , userData]) 

  return (
    <div className='flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400'>
      <img onClick={ () => navigate('/') } src={assets.logo} alt="" className='absolute top-5 left-10 w-28 sm:w-32 cursor-pointer'/>
      <div >
       
        <form className='bg-slate-900 rounded-lg w-full sm:w-96  p-8 text-sm'
         onPaste={ (e) => handlePaste(e)}
         onSubmit={ onSubmitHandler } >
          <h2 className='font-semibold text-2xl text-white text-center mb-4 '>Email Verify OTP</h2>
          <p className='text-sm text-indigo-300 text-center mb-6'>Enter the 6 digit code sent to your email id.</p>
          <div className='flex justify-between mb-8'>
            { Array(6).fill(0).map((_, index) => (
              <input type="text" maxLength='1' key={index} required 
              className='w-12 h-12 text-white text-center rounded-md text-xl bg-[#333A5C]'
              ref={ (e) => inputRefs.current[index] = e}
              onInput={ (e) => handleInput(e ,index)}
              onKeyDown={ (e) => handleKeyDown(e , index)}
               />
              
            ))}
          </div>
          <button className='w-full text-white py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 rounded-full'>Verify Email</button>
        </form>

      </div>
      
    </div>
  )
}

export default EmailVerify
