import { Router } from "express";
import { prisma } from "../db.js";
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'url';
import path from 'path';
import ffmpegPath from 'ffmpeg-static';

ffmpeg.setFfmpegPath(ffmpegPath);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

const router = Router();

let playlist = [];
let currentSongIndex = -1;
let currentTime = 0;
let isPlaying = false;
let interval;

router.get('/download', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title;
        const artist = info.videoDetails.author.name;
        const videoId = info.videoDetails.videoId;
        const thumbnails = info.videoDetails.thumbnails;

        const audioPath = `./public/mp3/${videoId}.mp3`;

        const audioStream = ytdl(url, { filter: 'audioonly' });

        ffmpeg(audioStream)
            .audioBitrate(128)
            .save(audioPath)
            .on('end', async () => {
                const existingSong = await prisma.song.findFirst({
                    where: {
                        title,
                        artist,
                    },
                });

                if (!existingSong) {
                    const newSong = await prisma.song.create({
                        data: {
                            title,
                            artist,
                            videoId,
                            audioPath: `${videoId}.mp3`,
                            thumbnails: {
                                create: thumbnails.map(thumb => ({
                                    url: thumb.url,
                                    width: thumb.width,
                                    height: thumb.height,
                                })),
                            },
                        },
                        include: {
                            thumbnails: true,
                        },
                    });

                    playlist.push({
                        title: newSong.title,
                        artist: newSong.artist,
                        audioPath: newSong.audioPath,
                        thumbnails: newSong.thumbnails,
                    });
                }

                if (currentSongIndex === -1) {
                    currentSongIndex = 0;
                }

                res.json({ title, artist, audio_path: `${videoId}.mp3`, thumbnails });
            })
            .on('error', (err) => {
                console.error(err);
                res.status(500).json({ error: 'Failed to convert video to MP3' });
            });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process the YouTube URL' });
    }
});

export default router;