import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

export function useFFmpeg() {
    const [loaded, setLoaded] = useState(false);
    const [progress, setProgress] = useState(0);
    const ffmpegRef = useRef<FFmpeg | null>(null);
    const messageRef = useRef<HTMLParagraphElement | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && !ffmpegRef.current) {
            ffmpegRef.current = new FFmpeg();
            const ffmpeg = ffmpegRef.current;

            ffmpeg.on('log', ({ message }) => {
                console.log(message);
                if (messageRef.current) messageRef.current.innerHTML = message;
            });

            ffmpeg.on('progress', ({ progress }) => {
                setProgress(progress);
            });
        }
    }, []);

    const load = async () => {
        if (!ffmpegRef.current) return;
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        const ffmpeg = ffmpegRef.current;

        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        setLoaded(true);
    };

    const processFusion = async (audioFile: File, videoFiles: File[]) => {
        if (!ffmpegRef.current) return new Blob([], { type: 'video/mp4' });
        if (!loaded) await load();
        const ffmpeg = ffmpegRef.current;

        // 1. Write Audio File
        await ffmpeg.writeFile('audio.mp3', await fetchFile(audioFile));

        // 2. Write Video Files & Create Concat List
        let concatContent = '';
        for (let i = 0; i < videoFiles.length; i++) {
            const fileName = `video${i}.mp4`;
            await ffmpeg.writeFile(fileName, await fetchFile(videoFiles[i]));
            concatContent += `file '${fileName}'\n`;
        }
        await ffmpeg.writeFile('concat_list.txt', concatContent);

        // 3. Concatenate Videos into one intermediate file
        await ffmpeg.exec([
            '-f', 'concat',
            '-safe', '0',
            '-i', 'concat_list.txt',
            '-c', 'copy',
            'combined.mp4'
        ]);

        // 4. Final Fusion
        await ffmpeg.exec([
            '-stream_loop', '-1',
            '-i', 'combined.mp4',
            '-i', 'audio.mp3',
            '-map', '0:v',
            '-map', '1:a',
            '-c:v', 'libx264',
            '-preset', 'ultrafast',
            '-c:a', 'copy',
            '-shortest',
            'output.mp4'
        ]);

        // 5. Read Output
        const data = await ffmpeg.readFile('output.mp4');
        const blobData = data instanceof Uint8Array ? data.buffer : data;
        return new Blob([blobData as any], { type: 'video/mp4' });
    };

    return { loaded, load, processFusion, progress };
}
