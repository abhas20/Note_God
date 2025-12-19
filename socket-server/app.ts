import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app=express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors({
    origin:[FRONTEND_URL],
    credentials:true
}))

app.use(express.urlencoded({extended:true})); // for parsing application/x-www-form-urlencoded
app.use(cookieParser()); 


export default app;