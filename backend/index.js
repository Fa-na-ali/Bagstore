require('dotenv').config()
const express = require('express')
const cookieParser = require("cookie-parser");
const cors = require('cors')
const app = express();
const server = require('http').Server(app);
const { Server } = require('socket.io');
const path = require('path')

const NODE_ENV = process.env.NODE_ENV || "development";
const ORIGIN = NODE_ENV === "production"
  ? process.env.DOMAIN_URL
  : process.env.FRONTEND_URL;

const io = new Server(server, {
  cors: {
    origin: ORIGIN,
  }
});


app.use(cookieParser());
app.use(cors({
  origin: ORIGIN,
  credentials: true,
}));
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});
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
app.use("/api/orders", (req, res, next) => {
  req.io = io;
  next();
}, orderRouter);
app.use("/api/wallet", walletRouter);

// Socket.IO
io.on('connection', (socket) => {
  console.log(`Socket ${socket.id} connected`);

  socket.on('sendMessage', (message) => {
    io.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
});


//connecting to the server
server.listen(PORT, () => {
  console.log(`server running at port ${PORT}`)
})
