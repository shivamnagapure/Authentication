import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'

const Header = () => {
  const { userData } = useContext(AppContext)
  return (
    <div className='grid place-content-center justify-items-center h-screen text-center px-4 mt-15 text-gray-800'>
      <img src={assets.header_img} className='w-36 h-36 rounded-full mb-6 '/>
      <h1 className='flex gap-2 place-items-center text-xl sm:text-3xl font-medium mb-2'> Hey {userData ? userData.name : 'Developer' }!
        <img src={assets.hand_wave} alt="" className='w-8 aspect-square'  /></h1>
      <h2 className='text-3xl sm:text-5xl font-semibold mb-4'>Welcome to our app </h2>
      <p className='mb-8 max-w-md'>Let's start with the quick product tour and we will have you up and running in on time!</p>
      <button className='border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100 transition-all'>Get Started</button>
    </div>
  )
}

export default Header
//