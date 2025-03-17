import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const ResetPassword = () => {
  axios.defaults.withCredentials = true 

  const { backendUrl } = useContext(AppContext)
  const navigate = useNavigate()
  const [ email , setEmail ] = useState('')
  const [ newPassword , setNewPassword ] = useState('')
  const [ isEmailSent , setIsEmailSent ] = useState(false)
  const [ otp , setOtp ] = useState(0)
  const [ isOtpSubmitted , setIsOtpSubmitted ] = useState(false)

  const inputRefs = React.useRef([])

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

  const onSubmitEmail = async (e) => {
    e.preventDefault();

    try {

      const { data } = await axios.post( backendUrl + '/api/auth/send-reset-otp' , {email})
      data.success ? toast.success(data.message) : toast.error(data.message)
      data.success && setIsEmailSent(true)
    } catch (error) {
      toast.error(error.message)
    }
    
  }

  const onSubmitOtp = async (e) => {
    try {
      e.preventDefault();
        const otpArray = inputRefs.current.map(e => e.value)
        setOtp( otpArray.join(''))
        setIsOtpSubmitted(true)
    } catch (error) {
        toast.error(error.message)
    }
            
  }

  const onSubmitNewPassword = async (e) => { 
    e.preventDefault();
    try {
      const {data} = await axios.post( backendUrl + '/api/auth/reset-password' ,{ email , otp , password : newPassword})
      data.success ? toast.success(data.message) : toast.error(data.message)
      data.success && navigate('/login')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className='flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400'>
      <img src={assets.logo} alt="" className='absolute left-20 sm:left-10 top-5 '/>
      <div>
      
      {!isEmailSent &&
        <form onSubmit={onSubmitEmail} className='bg-slate-900 rounded-lg w-full sm:w-96 p-8 text-sm'> 
          <h2 className='text-white font-semibold text-center text-2xl mb-4'>Reset Password</h2>
          <p className='text-indigo-300 text-center texxt-sm mb-6 '>Enter your registered email address</p>
          <div className='flex gap-3 px-5 py-2.5 items-center w-full rounded-full bg-[#333A5C] mb-6 '>
            <img src={assets.mail_icon} alt="" />
            <input type="text" placeholder='Email id' className="bg-transparent outline-none text-white" 
            value={email} onChange={ e => setEmail(e.target.value)} required />
          </div>
          <button className='w-full font-medium  text-white py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900'>Submit</button>
        </form>
      }
    

        {/* otp input form */}

       { !isOtpSubmitted && isEmailSent &&
        <form onSubmit={onSubmitOtp} className='bg-slate-900 rounded-lg w-full sm:w-96  p-8 text-sm'
         onPaste={ (e) => handlePaste(e)}>
          <h2 className='font-semibold text-2xl text-white text-center mb-4 '>Reset Password OTP</h2>
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
          <button className='w-full text-white py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 rounded-full'>Submit</button>
        </form>
      }

      { isOtpSubmitted && isEmailSent && 
        <form onSubmit= { onSubmitNewPassword } className='bg-slate-900 rounded-lg w-full sm:w-96 p-8 text-sm'> 
          <h2 className='text-white font-semibold text-center text-2xl mb-4'>New Password</h2>
          <p className='text-indigo-300 text-center texxt-sm mb-6 '>Enter the password below</p>
          <div className='flex gap-3 px-5 py-2.5 items-center w-full rounded-full bg-[#333A5C] mb-6 '>
            <img src={assets.lock_icon} alt="" />
            <input onChange={ e => setNewPassword(e.target.value)} value={newPassword}
            type='password' placeholder='Password' className="bg-transparent outline-none text-white" 
            required />
          </div>
          <button className='w-full font-medium  text-white py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900'>Submit</button>
        </form>
      }

      </div>
    </div>

    // set new password
    
  )
}

export default ResetPassword
