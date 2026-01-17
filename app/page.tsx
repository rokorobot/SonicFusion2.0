'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Video, Play, Download, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AudioUploader } from '@/components/AudioUploader';
import { VideoUploader } from '@/components/VideoUploader';
import { useFFmpeg } from '@/hooks/useFFmpeg';

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [halfDownloadUrl, setHalfDownloadUrl] = useState<string | null>(null);

  const { processFusion, processHalfLength, progress, load: loadFFmpeg, loaded } = useFFmpeg();

  const handleAudioSelected = (file: File | null, duration: number) => {
    setAudioFile(file);
    setAudioDuration(duration);
    setDownloadUrl(null);
    setHalfDownloadUrl(null);
  };

  const handleVideosSelected = (files: File[]) => {
    setVideoFiles(files);
    setDownloadUrl(null);
    setHalfDownloadUrl(null);
  };

  const handleProcess = async () => {
    if (!audioFile || videoFiles.length === 0) return;

    setIsProcessing(true);
    setDownloadUrl(null);
    setHalfDownloadUrl(null);

    try {
      if (!loaded) await loadFFmpeg();

      console.log("Starting fusion process...");
      const blob = await processFusion(audioFile, videoFiles);
      console.log("Fusion complete, blob size:", blob.size);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      // Generate half length version immediately after
      if (processHalfLength) {
        console.log("Starting half-length process. Duration:", audioDuration);
        const halfBlob = await processHalfLength(audioDuration, blob);
        console.log("Half-length blob result:", halfBlob);
        if (halfBlob) {
          console.log("Half-length blob size:", halfBlob.size);
          const halfUrl = URL.createObjectURL(halfBlob);
          setHalfDownloadUrl(halfUrl);
        } else {
          console.error("Half-length blob is null");
        }
      } else {
        console.error("processHalfLength is not defined");
      }

    } catch (error) {
      console.error("Processing failed:", error);
      alert("Processing failed. See console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden relative selection:bg-blue-500/30">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Sonic<span className="font-light">Fusion</span>
            </h1>
          </div>
          <button className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium">
            Export History
          </button>
        </header>

        {/* Main Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 flex flex-col gap-6 overflow-y-auto pr-2">

            {/* Audio Section */}
            <section className="glass-panel rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <Music className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold">Audio Source</h2>
              </div>
              <AudioUploader onAudioSelected={handleAudioSelected} />
            </section>

            {/* Video Section */}
            <section className="glass-panel rounded-2xl p-6 flex-1 flex flex-col animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  <Video className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold">Visuals</h2>
              </div>
              <VideoUploader onVideosSelected={handleVideosSelected} />
            </section>

          </div>

          {/* Right Column: Preview & Actions */}
          <div className="lg:col-span-7 flex flex-col gap-6 overflow-y-auto pr-2">

            {/* Preview Window */}
            <div className="glass-panel rounded-2xl p-1 flex-1 relative overflow-hidden group animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 z-10 pointer-events-none" />
              <div className="w-full h-full bg-black/40 rounded-xl flex items-center justify-center relative">
                {downloadUrl ? (
                  <video
                    src={downloadUrl}
                    controls
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/10">
                      <Play className="w-6 h-6 text-white/50 ml-1" />
                    </div>
                    <p className="text-gray-500 text-sm">Preview will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="glass-panel rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Target Duration</span>
                  <span className="text-xl font-mono text-white">{formatDuration(audioDuration)}</span>
                </div>

                <div className="flex items-center gap-4">
                  {isProcessing && (
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-blue-400 font-medium">Processing...</span>
                      <span className="text-xs text-gray-500 font-mono">{(progress * 100).toFixed(0)}%</span>
                    </div>
                  )}

                  {downloadUrl ? (
                    <div className="flex gap-2">
                      <a
                        href={downloadUrl}
                        download="fusion_output.mp4"
                        className="px-6 py-4 rounded-xl font-semibold flex items-center gap-2 bg-green-600 text-white shadow-lg shadow-green-600/20 hover:shadow-green-600/40 transition-all transform hover:scale-105 active:scale-95"
                      >
                        <Download className="w-5 h-5" />
                        Full
                      </a>
                      {halfDownloadUrl && (
                        <a
                          href={halfDownloadUrl}
                          download="fusion_output_half.mp4"
                          className="px-6 py-4 rounded-xl font-semibold flex items-center gap-2 bg-purple-600 text-white shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 transition-all transform hover:scale-105 active:scale-95"
                        >
                          <Download className="w-5 h-5" />
                          Half
                        </a>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={handleProcess}
                      disabled={isProcessing || !audioFile || videoFiles.length === 0}
                      className={cn(
                        "px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95",
                        isProcessing || !audioFile || videoFiles.length === 0
                          ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
                      )}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                      {isProcessing ? 'Processing' : 'Generate Fusion'}
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
