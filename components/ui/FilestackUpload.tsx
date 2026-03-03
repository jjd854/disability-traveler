'use client';

import React, { useState } from 'react';
import { init } from 'filestack-js';
import { FileInfo } from '@/lib/types'; // adjust the import path as needed

const filestack = init('Ac4UPEms0QsGVG6RBPstaz');

interface Props {
  name: string;
  maxFiles?: number;
  label?: string;
  onUpload?: (files: FileInfo[]) => void;
  onUploadDone?: (files: any) => void;
}

export default function FilestackUpload({ name, maxFiles = 5, label, onUpload, onUploadDone }: Props) {
  const [files, setFiles] = useState<FileInfo[]>([]);

  const handleClick = () => {
    const picker = filestack.picker({
      accept: ['image/*'],
      maxFiles,
      onUploadDone: async (result) => {
        const uploaded = await Promise.all(
          result.filesUploaded.map(async (file: any) => {
            let altText = '';

            try {
              const metaUrl = `https://cdn.filestackcontent.com/metadata/${file.handle}`;
              const res = await fetch(metaUrl);
              const meta = await res.json();
              altText = meta.alt_text || '';
           } catch (error) {
             console.warn(`Failed to fetch alt text for ${file.filename}`, error);
           }

           return {
            url: file.url,
            alt: altText,
            width: file.width,
            height: file.height,
         };
       })
     );

     setFiles(uploaded);
     onUpload?.(uploaded);
     onUploadDone?.(result);
   },

    });

    picker.open();
  };

  const handleAltChange = (index: number, alt: string) => {
    const updated = [...files];
    updated[index].alt = alt;
    setFiles(updated);
    onUpload?.(updated); // keep parent updated
  };

  return (
    <div>
      <button type="button" onClick={handleClick}>
        {label ?? `Upload ${name}`}
      </button>
    </div>
  );
}







