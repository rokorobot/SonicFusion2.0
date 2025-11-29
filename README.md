# SonicFusion2.0

SonicFusion2.0 is a web application that fuses MP3 audio files with MP4 video files. It allows users to create a new video where the visual content adapts to the length of the audio track.

## Features

-   **Audio & Video Fusion**: Combine an MP3 audio file with multiple MP4 video files.
-   **Automatic Looping**: Video content loops to match the duration of the audio.
-   **Full & Half Length Downloads**:
    -   **Full**: Download the complete fused video.
    -   **Half**: Download a version cut to half the duration of the original audio.
-   **Client-Side Processing**: Uses FFmpeg.wasm to process media directly in the browser.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technologies Used

-   Next.js
-   React
-   FFmpeg.wasm
-   Tailwind CSS
-   Framer Motion
