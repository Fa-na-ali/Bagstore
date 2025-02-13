require('dotenv').config()
const express=require('express')
const cookieParser = require("cookie-parser");
const cors=require('cors')
const app=express();
const path=require('path')

app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",  
    credentials: true,
}));
const userRouter = require('./routes/userRoutes')
const productRouter = require('./routes/productRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const dbConnect = require('./config/db')


const PORT=process.env.PORT || 5004

//database connection calling
dbConnect();

//middlewares


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json())
app.use(express.urlencoded({extended:true}))


//routes
app.use('/api/user',userRouter)
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRouter);







 

//connecting to the server
app.listen(PORT,()=>{
    console.log(`server running at port ${PORT}`)
})
