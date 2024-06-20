import { Server } from 'socket.io';

let playlist = [];
let currentSongIndex = -1;
let currentTime = 0;
let isPlaying = false;
let interval;

function setupSocket(server) {
    const io = new Server(server, {
    cors: {
        origin: "*", // Permitir cualquier origen
        methods: ["GET", "POST"]
    }
});

    io.on('connection', (socket) => {
        if (currentSongIndex !== -1) {
            socket.emit('newSong', playlist[currentSongIndex]);
            socket.emit('syncTime', { time: currentTime, isPlaying: isPlaying });
        }

        socket.on('playSong', (song) => {
            const existingSongIndex = playlist.findIndex(s => s.title === song.title && s.artist === song.artist);
            if (existingSongIndex === -1) {
                playlist.push(song);
                if (currentSongIndex === -1) {
                    currentSongIndex = 0;
                    playCurrentSong(io);
                }
                io.emit('updatePlaylist');
            }
        });

        socket.on('requestSync', () => {
            if (currentSongIndex !== -1) {
                socket.emit('syncTime', { time: currentTime, isPlaying: isPlaying });
            }
        });

        socket.on('play', () => {
            isPlaying = true;
            io.emit('play');
            startSyncing(io);
        });

        socket.on('stop', () => {
            isPlaying = false;
            io.emit('stop');
            clearInterval(interval);
        });

        socket.on('next', () => {
            if (currentSongIndex < playlist.length - 1) {
                currentSongIndex++;
                playCurrentSong(io);
            } else {
                stopService(io);
            }
        });

        socket.on('previous', () => {
            if (currentSongIndex > 0) {
                currentSongIndex--;
                playCurrentSong(io);
            }
        });

        socket.on('songEnded', () => {
            if (currentSongIndex !== -1) {
                playlist.splice(currentSongIndex, 1);
                if (currentSongIndex >= playlist.length) {
                    currentSongIndex = playlist.length - 1;
                }
                if (currentSongIndex === -1) {
                    stopService(io);
                } else {
                    playCurrentSong(io);
                }
                io.emit('updatePlaylist');
            }
        });
    });
}

function playCurrentSong(io) {
    const song = playlist[currentSongIndex];
    currentTime = 0;
    isPlaying = true;
    io.emit('newSong', song);
    startSyncing(io);
}

function startSyncing(io) {
    clearInterval(interval);
    interval = setInterval(() => {
        if (isPlaying) {
            currentTime++;
            io.emit('syncTime', { time: currentTime, isPlaying: isPlaying });
        }
    }, 1000);
}

function stopService(io) {
    isPlaying = false;
    currentSongIndex = -1;
    playlist = [];
    clearInterval(interval);
    io.emit('stop');
}

export { setupSocket };
