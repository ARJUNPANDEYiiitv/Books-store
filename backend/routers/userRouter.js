import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import data from '../data.js';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import {generateToken, isAuth}   from '../util.js';


const userRouter = express.Router();

userRouter.get(
  '/seed',
  expressAsyncHandler(async (req, res) => {
    await User.remove({});
    const createdUsers = await User.insertMany(data.users);
    res.send({ createdUsers });
  })
);



userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    const userEmail = await User.findOne({ email: req.body.emailOrMob });
    const userMob = await User.findOne({phNumber: req.body.emailOrMob })
    const user= userEmail || userMob;
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          name:user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phNumber: user.phNumber,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
        //jforge NPM
        return;
      }
    }
    res.status(401).send({ message: 'Invalid email or password' });
  })
);
userRouter.post(
  '/register',
  expressAsyncHandler(async (req, res) => {
    const user = new User({
      name: req.body.firstName.concat(" ",req.body.lastName),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phNumber:req.body.phNumber,
      password: bcrypt.hashSync(req.body.password, 8),
    });
    const createdUser = await user.save();
    res.send({
      name:createdUser.name,
      _id: createdUser._id,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      email: createdUser.email,
      phNumber: createdUser.phNumber,
      isAdmin: createdUser.isAdmin,
      token: generateToken(createdUser),
    });
  })
);

userRouter.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: 'User Not Found' });
    }
  })
);

userRouter.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
      user.phNumber = req.body.phNumber || user.phNumber;
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }
      const updatedUser = await user.save();
      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phNumber: updatedUser.phNumber,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser),
      });
    }
  })
);



export default userRouter;