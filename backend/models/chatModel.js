import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    name: {type: String, required:true},
    socketId:{type:String,required:true},
    online:{type:Boolean},
    _id:{type:String,required:true},
    isAdmin:{type:Boolean,default:false},
    messages:[{
        body:{type:String},
        name:{type:String},
        isAdmin:{type:Boolean,default:false},
        _id:{type:String},
        userInformation:{type:String},
    }],
    
  },
  {
    timestamps: true,
  }
);
const Chat = mongoose.model('Chat', chatSchema);

export default Chat;