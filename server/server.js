import express from "express" ;
import cors from "cors";
import 'dotenv/config' ;
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 3000 ;
connectDB();

const allowedOrigins = ['http://localhost:5173' , 'https://authentication-client-8k72.onrender.com' , 'http://localhost:3000'] //to run this code on other server

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin:allowedOrigins , credentials : true}));



//Routes
app.get('/' , (req,res) => {
    res.send("Api Working");
});

app.use('/api/auth' , authRouter);
app.use('/api/user' , userRouter);


app.listen(port , () => {
    console.log(`Server started on PORT: ${port}`);  
})
