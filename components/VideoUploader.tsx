'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Video, X, Plus, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Reorder, useDragControls } from 'framer-motion';

interface VideoUploaderProps {
    onVideosSelected: (files: File[]) => void;
}

export function VideoUploader({ onVideosSelected }: VideoUploaderProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const updateFiles = (newFiles: File[]) => {
        setFiles(newFiles);
        onVideosSelected(newFiles);
    };

    const handleFiles = (selectedFiles: FileList | File[]) => {
        const validFiles = Array.from(selectedFiles).filter(f => f.type.startsWith('video/'));
        updateFiles([...files, ...validFiles]);
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
        if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    };

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        updateFiles(newFiles);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Drop Zone */}
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={cn(
                    "border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer group relative mb-4 shrink-0",
                    isDragging ? "border-purple-500 bg-purple-500/10" : "border-white/10 hover:border-purple-500/50",
                    files.length === 0 ? "h-[200px] flex flex-col items-center justify-center" : "h-auto py-8"
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="video/mp4,video/quicktime"
                    multiple
                    className="hidden"
                    onChange={onChange}
                />

                <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300">
                    {files.length === 0 ? (
                        <Video className="w-10 h-10 mx-auto text-gray-500 group-hover:text-purple-400" />
                    ) : (
                        <Plus className="w-8 h-8 mx-auto text-gray-500 group-hover:text-purple-400" />
                    )}
                </div>
                <p className="text-sm text-gray-400 group-hover:text-gray-300">
                    {files.length === 0 ? (
                        <>Drop multiple <span className="text-purple-400">MP4s</span> here</>
                    ) : (
                        <>Add more videos</>
                    )}
                </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    <Reorder.Group axis="y" values={files} onReorder={updateFiles}>
                        {files.map((file, index) => (
                            <Reorder.Item key={`${file.name}-${index}`} value={file}>
                                <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-3 group hover:bg-white/10 transition-colors">
                                    <GripVertical className="w-4 h-4 text-gray-600 cursor-grab active:cursor-grabbing" />
                                    <div className="w-10 h-10 bg-black/50 rounded flex items-center justify-center text-purple-400 shrink-0">
                                        <Video className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-200 truncate">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="p-2 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </div>
            )}
        </div>
    );
}
