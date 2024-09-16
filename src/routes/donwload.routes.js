import { Router } from "express";
import { prisma } from "../db.js";
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'url';
import path from 'path';
import ffmpegPath from 'ffmpeg-static';
import pkg from 'youtube-dl-exec';
const { exec } = pkg;

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
        // Obtener información del video de YouTube
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title;
        const artist = info.videoDetails.author.name;
        const videoId = info.videoDetails.videoId;
        const audioPath = `public/mp3/${videoId}.mp3`;
        const thumbnails = info.videoDetails.thumbnails.map(thumb => ({
            url: thumb.url,
            width: thumb.width,
            height: thumb.height,
        }));
        console.log(info);
    
        // Descargar y convertir el video a MP3
        await exec(url, {
            extractAudio: true,
            audioFormat: 'mp3', // Cambiado a 'mp3'
            output: audioPath,
            ffmpegLocation: ffmpegPath,
        });
    
        // Verificar si la canción ya está en la lista de reproducción
        const existingSong = await prisma.song.findFirst({
            where: {
                title,
                artist,
            },
        });
    
        if (!existingSong) {
            // Crear una nueva canción en la base de datos
            const newSong = await prisma.song.create({
                data: {
                    title,
                    artist,
                    videoId,
                    audioPath: `${videoId}.mp3`,
                    thumbnails: {
                        create: thumbnails,
                    },
                },
                include: {
                    thumbnails: true,
                },
            });
    
            // Agregar la canción a la lista de reproducción
            playlist.push({
                title: newSong.title,
                artist: newSong.artist,
                audioPath: newSong.audioPath,
                thumbnails: newSong.thumbnails,
            });
        }
    
        // Si no hay ninguna canción en reproducción, reproducir la nueva canción
        if (currentSongIndex === -1) {
            currentSongIndex = 0;
        }
    
        // Enviar la respuesta como JSON
        res.json({ title, artist, audio_path: `${videoId}.mp3`, thumbnails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }

    // try {
    //     const info = await ytdl.getInfo(url);
    //     const title = info.videoDetails.title;
    //     const artist = info.videoDetails.author.name;
    //     const videoId = info.videoDetails.videoId;
    //     const thumbnails = info.videoDetails.thumbnails;

    //     const audioPath = `./public/mp3/${videoId}.mp3`;

    //     const audioStream = ytdl(url, { filter: 'audioonly' });

    //     ffmpeg(audioStream)
    //         .audioBitrate(128)
    //         .save(audioPath)
    //         .on('end', async () => {
    //             const existingSong = await prisma.song.findFirst({
    //                 where: {
    //                     title,
    //                     artist,
    //                 },
    //             });

    //             if (!existingSong) {
    //                 const newSong = await prisma.song.create({
    //                     data: {
    //                         title,
    //                         artist,
    //                         videoId,
    //                         audioPath: `${videoId}.mp3`,
    //                         thumbnails: {
    //                             create: thumbnails.map(thumb => ({
    //                                 url: thumb.url,
    //                                 width: thumb.width,
    //                                 height: thumb.height,
    //                             })),
    //                         },
    //                     },
    //                     include: {
    //                         thumbnails: true,
    //                     },
    //                 });

    //                 playlist.push({
    //                     title: newSong.title,
    //                     artist: newSong.artist,
    //                     audioPath: newSong.audioPath,
    //                     thumbnails: newSong.thumbnails,
    //                 });
    //             }

    //             if (currentSongIndex === -1) {
    //                 currentSongIndex = 0;
    //             }

    //             res.json({ title, artist, audio_path: `${videoId}.mp3`, thumbnails });
    //         })
    //         .on('error', (err) => {
    //             console.error(err);
    //             res.status(500).json({ error: 'Failed to convert video to MP3' });
    //         });
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ error: 'Failed to process the YouTube URL' });
    // }
});

export default router;