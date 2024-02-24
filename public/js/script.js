let socket = io()

let joinBtn = document.getElementById('join')
let roomName = document.getElementById('roomName')
let localVideo = document.getElementById('user-video')
let remoteVideo = document.getElementById('peer-video')

const iceServers = {
  iceServers: [
    {url: 'stun:stun01.sipphone.com'},
    {url: 'stun:stun.ekiga.net'},
    {url: 'stun:stunserver.org'},
    {url: 'stun:stun.softjoys.com'},
    {
      url: 'turn:192.158.29.39:3478?transport=udp',
      credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      username: '28224511:1379330808'
    },
    {
      url: 'turn:192.158.29.39:3478?transport=tcp',
      credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      username: '28224511:1379330808'
    }
  ]
}
let localPeerConnection, remotePeerConnection = null

joinBtn.addEventListener("click", function() {
  initLocalConnection()
  initRemoteConnection()
})


function initLocalConnection() {
  if (navigator.mediaDevices===undefined) {
    navigator.mediaDevices = {};
  }
  if (navigator.mediaDevices.getUserMedia===undefined) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      // Сначала, если доступно, получим устаревшее getUserMedia
      
      let getUserMedia =
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      
      //Некоторые браузеры не реализуют его, тогда вернём отменённый промис
      // с ошибкой для поддержания последовательности интерфейса
      
      if (!getUserMedia) {
        return Promise.reject(
          new Error("getUserMedia is not implemented in this browser"),
        );
      }
      
      // Иначе, обернём промисом устаревший navigator.getUserMedia
      
      return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }
  navigator.mediaDevices
           .getUserMedia({audio: true, video: true})
           .then((stream) => {
             localVideo.srcObject = stream;
             joinBtn.hidden = true;
             
             const videoTrack = stream.getVideoTracks()[0]
             localPeerConnection = new RTCPeerConnection(iceServers)
             localPeerConnection.addEventListener('icecandidate', (e) => {
               if (e.candidate) {
                 socket.emit('LOCAL_CANDIDATE', e.candidate)
               }
             })
             
             socket.on('REMOTE_CANDIDATE', (candidate) => {
               localPeerConnection.addIceCandidate(new RTCIceCandidate(candidate))
             })
             
             socket.on('REMOTE_DESCRIPTION', (description) => {
               localPeerConnection.setRemoteDescription(description)
             })
             
             localPeerConnection.addTrack(videoTrack, stream)
             localVideo.play()
             
             localPeerConnection.createOffer().then((description) => {
               localPeerConnection.setLocalDescription(description)
               
               socket.emit('LOCAL_DESCRIPTION', description)
             })
             
           })
           .catch(() => {
             alert('You can`t access media')
           })
}

function initRemoteConnection() {
  remotePeerConnection = new RTCPeerConnection(iceServers)
  
  socket.on('LOCAL_DESCRIPTION', (description) => {
    remotePeerConnection.setRemoteDescription(description)
    
    localPeerConnection.addEventListener('icecandidate', (e) => {
      if (e.candidate) {
        socket.emit('REMOTE_CANDIDATE', e.candidate)
      }
    })
    
    remotePeerConnection.addEventListener('track', (e) => {
      remoteVideo.srcObject = e.streams[0]
      remoteVideo.play()
    })
    
    socket.on('LOCAL_CANDIDATE', (candidate) => {
      remotePeerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    })
    
    remotePeerConnection.createAnswer().then((description) => {
      remotePeerConnection.setLocalDescription(description)
      
      socket.emit('REMOTE_DESCRIPTION', description)
    })
  })
}
