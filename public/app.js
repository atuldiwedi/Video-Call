// public/app.js
const socket = io('http://localhost:3000');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

let localStream;
let remoteStream;
let peerConnection;
const configuration = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
    },
  ],
};

// Create Room
function createRoom() {
  socket.emit('createRoom');
}

socket.on('roomCreated', ({ roomId }) => {
  console.log(`Created room with ID: ${roomId}`);
  startCall(roomId);
});

async function startCall(roomId) {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;

  socket.emit('join', { roomId });

  peerConnection = new RTCPeerConnection(configuration);
  peerConnection.onicecandidate = ({ candidate }) => {
    if (candidate) {
      socket.emit('signal', { roomId, signal: { candidate } });
    }
  };
  peerConnection.ontrack = (event) => {
    if (!remoteStream) {
      remoteStream = new MediaStream();
      remoteVideo.srcObject = remoteStream;
    }
    remoteStream.addTrack(event.track);
  };
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });
}

socket.on('joined', ({ roomId }) => {
  console.log(`Joined room ${roomId}`);
  peerConnection.createOffer().then((offer) => {
    peerConnection.setLocalDescription(offer);
    socket.emit('signal', { roomId, signal: { sdp: offer } });
  });
});

socket.on('signal', async (data) => {
  if (data.signal.sdp) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.signal.sdp));
    if (data.signal.sdp.type === 'offer') {
      peerConnection.createAnswer().then((answer) => {
        peerConnection.setLocalDescription(answer);
        socket.emit('signal', { roomId: data.roomId, signal: { sdp: answer } });
      });
    }
  } else if (data.signal.candidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(data.signal.candidate));
  }
});

// Example usage: create a new room or join an existing one
document.getElementById('createRoomButton').addEventListener('click', createRoom);
document.getElementById('joinRoomButton').addEventListener('click', () => {
  const roomId = prompt('Enter Room ID:');
  if (roomId) {
    startCall(roomId);
  }
});
