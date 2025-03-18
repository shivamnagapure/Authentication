import userModel from "../models/userModel.js";
import bcrypt from 'bcryptjs' ;
import  jwt from 'jsonwebtoken';
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE , PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";



export const register = async (req , res) => {
    const {name , email , password} = req.body ;

    if(!name || !email || !password ){
        return res.json({success : false , message : "Missing Details"});
    }

    try {
        const existingUser = await userModel.findOne({email});// checking existing user
        if(existingUser){
            return res.json({success : false , message : "User Already Exists"});
        }

        const hashPassword = await bcrypt.hash(password , 10); //generating hash password
        const user = new userModel({name , email , password : hashPassword}); // creating new user
        
        
        await user.save(); // saving new user data to database

        const token = jwt.sign({id : user._id}, process.env.JWT_SECRET , {expiresIn : '7d'}); 
        //(user._id) It contains the user's unique ID
        //(process.env.JWT_SECRET) secret key used to sign the token
        
        
        res.cookie('token' , token , {
            httpOnly : true ,
            secure : process.env.NODE_ENV === 'production',
            sameSite : process.env.NODE_ENV === 'production' ? 
            'none' : 'strict',
            maxAge : 7 * 24 * 60 * 60 * 1000 
        });

        
        //Sending Welcome mail
        const mailOptions = {
            from : process.env.SENDER_EMAIL,
            to : email ,
            subject : 'Welcome to MovieTrack',
            text : `Welcome to MovieTrack Website. Your account has been created with email id: ${email}.`
        }
        
        await transporter.sendMail(mailOptions);
        res.json({success : true});
        
    } catch (error) {
        res.json({success : false , message: error.message }); 
    }
};

export const login = async (req , res) => {
    const {email , password} = req.body ;

    if( !email || !password) {
        return res.json({success : true , message : " Email and Password are required"});
    }

    try {
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success : false , message : " Invalid email" });
        }
        
        const isMatch = await bcrypt.compare(password , user.password);

        if(!isMatch){
            return res.json({success : false , message: "Invalid Password" });
        }

        const token = jwt.sign({id : user._id}, process.env.JWT_SECRET , {expiresIn : '7d'}); 

        res.cookie('token' , token , {
            httpOnly : true ,
            secure : process.env.NODE_ENV === 'production',
            sameSite :  process.env.NODE_ENV === "production" ? "None" : "Lax" ,
            maxAge : 7 * 24 * 60 * 60 * 1000 
        });

        console.log("Set-Cookie Attempt:", res.getHeaders()["set-cookie"]);

        //return res.json({success : true});
        res.status(200).json({ success: true, token});

    } catch (error) {
        res.json({success : false , message : error.message});
        
    }
};

export const logout = async (req , res) => {
    try {
        res.clearCookie('token' , {
            httpOnly : true ,
            secure : process.env.NODE_ENV === 'production',
            samesite : process.env.NODE_ENV === 'production' ? 
            'none' : 'strict'   
        });
         
        res.json({success : true , message : "Logged Out"})

    } catch (error) {
        res.json({success : false , message : error.message});
    }
}

//Send Verification Otp to the users email
export const sendVerifyOtp = async (req , res) => {
    
    try {
        const { userId } = req.body ;

        const user = await userModel.findById(userId) ;

        if(user.isAccountVerified){
            return res.send({success : false , message : "Account Already Exists"});
        }

        const otp = Math.floor(100000 + Math.random() * 900000);//  Math.random() * 900000 {range 0 to 899999} , 100000 + Math.random() * 900000 {range 100000 to 999999}

        user.verifyOtp = otp ;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000 ;
        await user.save();

        const mailOptions = {
            from : process.env.SENDER_EMAIL,
            to : user.email ,
            subject : 'Account Verification OTP',
            // text : `Your OTP is ${otp}. Verify your Account using this OTP. `
            html : EMAIL_VERIFY_TEMPLATE.replace("{{email}}" , user.email).replace("{{otp}}" , otp)
        };

        await transporter.sendMail(mailOptions);

        return res.json({success : true , message : "Verification OTP Sent on Email"});

    } catch (error) {
        res.json({ success : false , message: error.message });
  
    }
}

//Verify the Email using OTP
export const verifyEmail = async (req , res) => {
    const { userId , otp } = req.body ;

    if(!userId || !otp){
        return res.json({success : false , message : "Missing Details"});
    }

    try {
        const user = await userModel.findById(userId);

        if(!user){
            return res.json({success : false , message : "User Not Found"});
        }

        if(user.verifyOtp === '' || user.verifyOtp !== otp){
            return res.json({success : false , message : "Invalid OTP"});
        }

        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success : false , message : "OTP Expired"});
        }

        user.isAccountVerified = true ;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0 ;

        user.save();
        return res.json({success : true , message : "Email Verified Successfuly"});

    } catch (error) {
        res.json({success : false , message : error.message});
    }
    
}

//Check if User is Authenticated
export const isAuthenticated = async (req , res) => {
    try {
        res.json({success : true});

    } catch (error) {
        res.json({success : false , message : error.message});
    }
}

//Send Reset Password OTP
export const sendResetOtp = async (req ,res) => {
    const { email } = req.body ;

    if(!email){
        return res.json({success : false , message :"Email is Required"})
    }

    try {
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success : false , message :"User not found"});
        }

        const otp = Math.floor(100000 + Math.random() * 900000);//  Math.random() * 900000 {range 0 to 899999} , 100000 + Math.random() * 900000 {range 100000 to 999999}

        user.resetOtp = otp ;
        user.resetOtpExpireAt = Date.now() + 15 * 60  * 1000 ;
        await user.save();

        const mailOptions = {
            from : process.env.SENDER_EMAIL,
            to : user.email ,
            subject : 'Password Reset OTP',
            // text : `Your OTP for resetting password is ${otp}. Use this OTP to proceed with resetting your password. `
            html : PASSWORD_RESET_TEMPLATE.replace("{{email}}" , user.email).replace("{{otp}}" , otp)

        };

        await transporter.sendMail(mailOptions);

        return res.json({success : true , message : "OTP Sent to Your Email"});

       
    } catch (error) {
        res.json({success : false , message : error.message});
    }
}

//Reset Your Password
export const resetPassword = async (req, res) => {
    const { email , otp , password } = req.body;

    if(!email || !otp || !password){

        
        return res.json({success : false , message : "Email , OTP  and new Password are required"});
    }

    try {
        const user = await userModel.findOne({email});

        if(!user){
            res.json({success : false , message : error.message});
        }

        if(user.resetOtp === '' || user.resetOtp !== otp){
            return res.json({success : false , message : "Invalid OTP"});
        }

        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success : false , message : "OTP Expired"});
        }

        const hashPassword = await bcrypt.hash(password , 10);
        user.password = hashPassword ;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0 ;
        await user.save();

        res.json({success : true , message : "Password reset successfully"});

    } catch (error) {
        res.json({success : false , message : error.message});
    }
}

