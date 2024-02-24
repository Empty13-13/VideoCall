const express = require('express')
const app = express()
const https = require('https')
const fs = require('fs')
let cors = require('cors')
const socket = require('socket.io')

app.use(cors())
const server = https
  .createServer(
    {
      key: fs.readFileSync('cert/privateKey.key'),
      cert: fs.readFileSync('cert/certificate.crt'),
    },
    app
  )
  .listen(3000, function() {
    console.log(
      `Server listens https://localhost:3000`
    );
  });


const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.set('view engine', 'ejs')
app.set('views', './views')

app.use(express.static('public'))

const userRoute = require('./routes/userRoute');
app.use('/', userRoute);


//socket.io
let io = socket(server)
io.on('connection', (socket) => {
  console.log('User connected: ' + socket.id)
  
  socket.on('LOCAL_CANDIDATE', (candidate) => {
    socket.emit('LOCAL_CANDIDATE',candidate)
    console.log('LOCAL_CANDIDATE')
  })
  socket.on('LOCAL_DESCRIPTION', (description) => {
    socket.emit('LOCAL_DESCRIPTION',description)
    console.log('LOCAL_DESCRIPTION')
  })
  socket.on('REMOTE_CANDIDATE', (candidate) => {
    socket.emit('REMOTE_CANDIDATE',candidate)
    console.log('REMOTE_CANDIDATE')
  })
  socket.on('REMOTE_DESCRIPTION', (description) => {
    socket.emit('REMOTE_DESCRIPTION',description)
    console.log('REMOTE_DESCRIPTION')
  })
  
})