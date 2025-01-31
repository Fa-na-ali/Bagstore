require('dotenv').config()
const express=require('express')
const cookieParser = require("cookie-parser");
const app=express();



const userRouter = require('./routes/userRoutes')
const dbConnect = require('./config/db')


const PORT=process.env.PORT || 5004

//database connection calling
dbConnect();

//middlewares
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());

//routes
app.use('/api/user',userRouter)





 

//connecting to the server
app.listen(PORT,()=>{
    console.log(`server running at port ${PORT}`)
})
