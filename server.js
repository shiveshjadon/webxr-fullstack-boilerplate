const express = require("express");
const app = express();

//https & cors init
const https = require('http')
app.use((req,res,next)=>{
  res.setHeader('Acces-Control-Allow-Origin','*');
  res.setHeader('Acces-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
  res.setHeader('Acces-Contorl-Allow-Methods','Content-Type','Authorization');
  next(); 
})
const server = https.createServer(app);
const port = 4000;

const socketio = require('socket.io');
const io = socketio(server, {
  cors: {
    origin: '*',
  }
})

app.use(express.static(__dirname))

server.listen(port, () => {
  console.log(`||>> Server listening on ${port} <<||`)
});

io.on('connection', (socket) => {
  //connection start
  console.log('||>>connection start<<||')

  //connection lost
  socket.on('disconnect', () => {
    console.log('||>> connection end <<||')
  });

  socket.on('button', (query) => { 
    console.log(`~${query} clicked`);
  }) 
});