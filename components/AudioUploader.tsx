'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Music, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioUploaderProps {
    onAudioSelected: (file: File | null, duration: number) => void;
}

export function AudioUploader({ onAudioSelected }: AudioUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [duration, setDuration] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (selectedFile: File) => {
        if (selectedFile && selectedFile.type.startsWith('audio/')) {
            const objectUrl = URL.createObjectURL(selectedFile);
            const audio = new Audio(objectUrl);

            audio.onloadedmetadata = () => {
                setDuration(audio.duration);
                setFile(selectedFile);
                onAudioSelected(selectedFile, audio.duration);
                URL.revokeObjectURL(objectUrl);
            };
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
        setDuration(0);
        onAudioSelected(null, 0);
        if (inputRef.current) inputRef.current.value = '';
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div
            onClick={() => inputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group relative overflow-hidden",
                isDragging ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-blue-500/50",
                file ? "bg-blue-500/5 border-blue-500/30" : ""
            )}
        >
            <input
                ref={inputRef}
                type="file"
                accept="audio/mp3,audio/mpeg"
                className="hidden"
                onChange={onChange}
            />

            {file ? (
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-400">
                        <Music className="w-6 h-6" />
                    </div>
                    <p className="font-medium text-white truncate max-w-[200px] mx-auto">{file.name}</p>
                    <p className="text-sm text-blue-400 mt-1 font-mono">{formatDuration(duration)}</p>

                    <button
                        onClick={removeFile}
                        className="absolute -top-4 -right-4 p-2 text-gray-500 hover:text-red-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            ) : (
                <div className="relative z-10">
                    <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300">
                        <Music className="w-10 h-10 mx-auto text-gray-500 group-hover:text-blue-400" />
                    </div>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300">
                        Drop your <span className="text-blue-400">MP3</span> here
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Defines the final duration</p>
                </div>
            )}
        </div>
    );
}
