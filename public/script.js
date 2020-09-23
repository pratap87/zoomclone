const socket = io()
const videoGrid = document.getElementById('video-grid');
const startElem = document.getElementById("start");
const stopElem = document.getElementById("stop");
//NOTE: removing settings from peer constructor solved join-room event not emitting!
const myPeer = new Peer();

let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {};
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
            alert("New user!");
            connectToNewUser(userId, stream)
        })
        // input value
    let text = $("input");
    // when press enter send message
    $('html').keydown(function(e) {
        let value = text.val();
        if (e.which == 13 && value.length !== 0) {
            socket.emit('message', value);
            text.val('')

        }
    });
    socket.on("createMessage", message => {
        $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
        scrollToBottom()
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}



const scrollToBottom = () => {
    var d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
    const html = `
     <img src="./camera.png">
    <span>Stop Video</span>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}

startElem.addEventListener("click", function(evt) {
    startCapture();
}, false);

stopElem.addEventListener("click", function(evt) {
    stopCapture();
}, false);

var displayMediaOptions = {
    video: {
        cursor: "always"
    },
    audio: false
};

const startCapture = async() => {
    myVideo.srcObject = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    myVideo.style.width = "100%"
    myVideo.style.height = "100%"
    dumpOptionsInfo();
}

async function stopCapture(evt) {

    myVideo.srcObject = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    })
}

function dumpOptionsInfo() {
    const videoTrack = myVideo.srcObject.getVideoTracks()[0];

    console.info("Track settings:");
    console.info(JSON.stringify(videoTrack.getSettings(), null, 2));
    console.info("Track constraints:");
    console.info(JSON.stringify(videoTrack.getConstraints(), null, 2));
}