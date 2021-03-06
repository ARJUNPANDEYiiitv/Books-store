import express from 'express';
import  Mongoose  from 'mongoose';
import dotenv from 'dotenv';
import productRouter from './routers/productsRouter.js';
import userRouter from './routers/userRouter.js';
import path from 'path';
import multer from 'multer';
import expressAsyncHandler from 'express-async-handler';
import Product from './models/productModel.js';
import http from 'http';
import { Server } from 'socket.io';
import {isAuth} from './util.js';
import cloudinary from './cloudinary.js'
import Chat from './models/chatModel.js'

const app = express();
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

Mongoose.connect(process.env.MONGODB_URL , {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
const __dirname = path.resolve();

// app.use('/uploads', express.static(path.join(__dirname, '/Uploads')));
app.use(express.static(path.join(__dirname, '/frontend/build')));

const upload =multer({
  storage:multer.diskStorage({}),
});


app.post('/api/products/uploadProducts',isAuth,upload.single('image'),expressAsyncHandler(async(req,res)=>{
  try{
    const bookimage=await cloudinary.v2.uploader.upload(req.file.path,{folder:'BOOKS'})
    console.log("i am here");
    const createProducts=new Product({
      name:req.body.name,
      publisher:req.body.publisher,
      image:bookimage.secure_url,
      image_cloudinary_id: bookimage.public_id,
      price:req.body.price,
      description:req.body.description,
      sellerId:req.body.sellerId,
      sellerName:req.body.sellerName,
      sellerEmail:req.body.sellerEmail,
      phNumber:req.body.phNumber,
      pincode:req.body.pinCode,
      address:req.body.address,
      lat:req.body.lat,
      lng:req.body.lng,
    });
    const uploadProduct = await createProducts.save();
    res.status(200).send({message: 'Product Uploaded.', product: uploadProduct});
  }
  catch(error){
    res.status(404).send({message:'Product Upload Failed.'});
  }
}));
app.use('/api/users', userRouter);
app.use('/api/products',productRouter);
app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});


app.get('/api/config/google', (req, res) => {
  res.send(process.env.GOOGLEMAP_API_KEY);
});


const port = process.env.PORT;
const httpServer = http.Server(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
let users=[];
io.on('connection', (socket) => {
  socket.on('disconnect', async() => {
    const user =await Chat.findOne({socketId:socket.id});
    console.log(user);
    if (user) {
      user.online = false;
      const offline=await user.save();
      users=await Chat.find({});
      console.log('Offline', user.name);
    }
  });

  socket.on('onLogin',async (user) => {
    const updatedUser = {
      ...user,
      online: true,
      socketId: socket.id,
      messages: [],
    };
    const existUser = await Chat.findById(updatedUser._id);
    if (existUser) {
      existUser.socketId = socket.id;
      existUser.online = true;
      const update=await existUser.save();
     
    } else {
      const creat=await Chat.create(updatedUser);
    }
    console.log('Online', user.name);
   
    users=await Chat.find({});

     users.map((y)=>{
      io.to(y.socketId).emit('updateUser', updatedUser);
    });
  
      io.to(updatedUser.socketId).emit('listUsers', users);
    
  });
  

  socket.on('onUserSelected',async (user,login) => {
     const sender = await Chat.findOne({_id:login._id,online:true });
     if (sender) {
      const existUser = await Chat.findById(user._id);
     // console.log(existUser.messages);
      if(existUser)
      io.to(sender.socketId).emit('selectUser', sender);
   }
  });

 socket.on('onMessage', async(message) => {
      const user = await Chat.findById(message._id);
      const info=await Chat.findById(message.userInformation);
      if (user) {
        io.to(user.socketId).emit('message', message);
        user.messages.push(message);
        info.messages.push(message);
        await user.save();
        await info.save(); 
      } 
  });



});

app.get('*', (req, res) =>
   res.sendFile(path.join(__dirname, '/frontend/build/index.html'))
);

httpServer.listen(port, () => {
  console.log(`Serve at http://localhost:${port}`);
});




