import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext();

export const AppContextProvider = ({children}) => {

    axios.defaults.withCredentials = true

    const backendUrl = "https://authentication-dzpr.onrender.com";
    const  [isLoggedIn , setIsLoggedIn] = useState(false);
    const [userData , setUserData]  = useState(false);

    const getUserData = async () => {
        try {
          const { data } = await axios.get(backendUrl + '/api/user/data')
          data.success ? setUserData(data.userData) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getAuthState = async ()=> {
        try {
            const { data } = await axios.get(backendUrl + '/api/auth/is-auth')
            if(data.success){
                setIsLoggedIn(true)
                getUserData();
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    
    useEffect( () => {
        getAuthState();
    } , [])

    const value = {
        backendUrl , 
        isLoggedIn , setIsLoggedIn ,
        userData , setUserData,
        getUserData
    }   

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}
