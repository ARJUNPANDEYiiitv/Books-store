import React, { useEffect, useRef, useState } from 'react';
import socketIOClient from 'socket.io-client';
import { useSelector } from 'react-redux';
import MessageBox from '../components/MessageBox';
import {useHistory} from 'react-router-dom'
let allUsers = [];
let allMessages = [];
let allSelectedUser = {};
const ENDPOINT =
  window.location.host.indexOf('localhost') >= 0
    ? 'http://127.0.0.1:5000'
    : window.location.host;

export default function ChatScreen() {
  const [selectedUser, setSelectedUser] = useState({});
  const [socket, setSocket] = useState(null);
  const uiMessagesRef = useRef(null);
  const [messageBody, setMessageBody] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const history = useHistory();

  useEffect(() => {
    if (uiMessagesRef.current) {
      uiMessagesRef.current.scrollBy({
        top: uiMessagesRef.current.clientHeight,
        left: 0,
        behavior: 'smooth',
      });
    }
    //console.log(userInfo);
    if (!socket) {
      const sk = socketIOClient(ENDPOINT);
      setSocket(sk);
      sk.emit('onLogin', {
        _id: userInfo._id,
        name: userInfo.name,
        isAdmin: userInfo.isAdmin,
      });
      sk.on('message', (data) => {
        if (allSelectedUser._id === data._id) {
          allMessages = [...allMessages, data];
        } else {
          const existUser = allUsers.find((user) => user._id === data._id);
          if (existUser) {
            allUsers = allUsers.map((user) =>
              user._id === existUser._id ? { ...user, unread: true } : user  
            );
            allMessages = [...allMessages,data];
            setUsers(allUsers);
          }
        }
        let mes=[];
        allMessages.map((m)=>{
         if( m._id===userInfo._id && m.userInformation===allSelectedUser._id)
         {
           mes=[...mes,m];
         }
         else if( m._id===allSelectedUser._id && m.userInformation===userInfo._id)
         mes=[...mes,m];
         
      })
      
       setMessages(mes);
       
      });
      
      sk.on('updateUser', (updatedUser) => {
        const existUser = allUsers.find((user) => user._id === updatedUser._id);
        if (existUser) {
          allUsers = allUsers.map((user) =>
            user._id === existUser._id ? updatedUser : user
          );
          setUsers(allUsers);
        } else {
          allUsers = [...allUsers, updatedUser];
          setUsers(allUsers);
        }
      });
      sk.on('listUsers', (updatedUsers) => {
        console.log(updatedUsers);
        allUsers = updatedUsers;
        setUsers(allUsers);
      });
      sk.on('selectUser', (user) => {
         let mes=[];
         allMessages=user.messages;
         allMessages.map((m)=>{
          if( m._id===userInfo._id )
          {
            if(m.userInformation===allSelectedUser._id)
              mes.push(m)
          }
           if( m._id===allSelectedUser._id )
         {
           if(m.userInformation===userInfo._id)
            mes.push(m)
         }
          
       })
       
        setMessages(mes);
      });
    }
  }, [messages, socket, users,selectedUser]);

  const selectUser = (user) => {
    allSelectedUser = user;
    setSelectedUser(allSelectedUser);
    const existUser = allUsers.find((x) => x._id === user._id);
    if (existUser) {
      allUsers = allUsers.map((x) =>
        x._id === existUser._id ? { ...x, unread: false } : x
      );
      setUsers(allUsers);
    }
    socket.emit('onUserSelected', user,userInfo);
  };
  const backToChat=()=>{
    setSelectedUser({});
    history.push('/chat');
  }

  const submitHandler = (e) => {
    e.preventDefault();
    if (!messageBody.trim()) {
      alert('Error. Please type message.');
    } else {
      allMessages = [
        ...allMessages,
        { body: messageBody, name: userInfo.name , isAdmin: userInfo.isAdmin,
          _id: selectedUser._id,
          userInformation:userInfo._id},
      ];
      let tm=[];
      tm=messages;
      tm=[...tm, { body: messageBody, name: userInfo.name , isAdmin: userInfo.isAdmin,
        _id: selectedUser._id,
        userInformation:userInfo._id},];
       
      setMessages(tm);
      setMessageBody('');
      setTimeout(() => {
        socket.emit('onMessage', {
          body: messageBody,
          name: userInfo.name,
          isAdmin: userInfo.isAdmin,
          _id: selectedUser._id,
          userInformation:userInfo._id,
        });
      }, 1000);
    }
  };

  return (
    <div className="chatScreen">
      
      {selectedUser._id? <div className="grid-2">

        <div >
        <button onClick={backToChat} style={{marginLeft:'27rem'}}>X</button>
        <strong>Chat with {selectedUser.name} </strong>
        <ul ref={uiMessagesRef}>
          {messages.length === 0 && <li>No message.</li>}



          {messages.map((msg) => (
          <li>
            <strong>{`${msg.name}: `}</strong> {msg.body}
          </li>
          ))}


        </ul>
        
          <form onSubmit={submitHandler}>
            <input
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              type="text"
              placeholder="type message"
            />
            <button type="submit">Send</button>
          </form>
        </div>
    
  </div>: <div className="grid-1">
  
        {users.filter((x) => x._id !== userInfo._id).length === 0 && (
          <MessageBox>No Online User Found</MessageBox>
        )}
        <ul>
          {users
            .filter((x) => x._id !== userInfo._id && x.name)
            .map((user) => (
              <li
                key={user._id}
                className={user._id === selectedUser._id ? 'selected' : ''}
              >
                <div style={{display:'flex'}}>
                <button
                  className="block"
                  type="button"
                  onClick={() => selectUser(user)}
                >
                {user.name}
               
                </button>
                <div
                  className={
                     user.online ? 'online' : 'offline'
                  }
                ></div>
                 </div>
              </li>
            ))}
        </ul>
      </div>}
     
     
    </div>
  );
}