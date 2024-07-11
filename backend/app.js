import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import {dbConnection} from "./database/dbConnection.js"
import fileUpload from "express-fileupload";
import { errorMiddleware } from "./middlewares/error.js"
import userRouter from "./routes/userRouter.js"
import taskRouter from "./routes/taskRouter.js"



const app = express();
dotenv.config({path:"./config/config.env"});

app.use(cors({
    origin:[process.env.FRONTEND_URL],
    methods:["GET","PUT","DELETE","POST"],
    credentials: true,
}))


app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({extended:true}))

//file upload should use before db connection
app.use(fileUpload({
    
    useTempFiles : true,
    tempFileDir: "/temp/",


}));

//router should be used before db connection
app.use("/api/v1/user",userRouter);
app.use("/api/v1/task",taskRouter);

app.get("/",(req,res,next)=>{
    return res.status(200).json({
        success:true ,
        message : "Done!"
    });
});


dbConnection();

app.use(errorMiddleware);



export default app;