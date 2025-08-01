require('dotenv').config()
const express = require('express')
const cookieParser = require("cookie-parser");
const cors = require('cors')
const app = express();
const path = require('path')

app.use(cookieParser());

const corsOptions = {
  origin: [process.env.DOMAIN_URL, process.env.FRONTEND_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};
app.use(cors(corsOptions));
// app.use(cors({
//     origin: process.env.FRONTEND_URL,
//     credentials: true,
// }));
const userRouter = require('./routes/userRoutes')
const productRouter = require('./routes/productRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const orderRouter = require('./routes/orderRoutes')
const walletRouter = require('./routes/walletRoutes')
const dbConnect = require('./config/db')


const PORT = process.env.PORT || 5004

//database connection calling
dbConnect();

//middlewares
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


//routes
app.use('/api/user', userRouter)
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/wallet", walletRouter);

//connecting to the server
app.listen(PORT, () => {
  console.log(`server running at port ${PORT}`)
})
