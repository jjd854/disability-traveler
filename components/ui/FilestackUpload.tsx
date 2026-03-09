'use client';

import React, { useState } from 'react';
import { init } from 'filestack-js';
import type { FileInfo } from '@/lib/types';

const filestack = init('Ac4UPEms0QsGVG6RBPstaz');

type FilestackUploadedFile = {
  handle: string;
  filename?: string;
  url: string;
  width?: number;
  height?: number;
};

type FilestackUploadResult = {
  filesUploaded: FilestackUploadedFile[];
};

interface Props {
  name: string;
  maxFiles?: number;
  label?: string;
  onUpload?: (files: FileInfo[]) => void;
  onUploadDone?: (result: FilestackUploadResult) => void;
}

export default function FilestackUpload({
  name,
  maxFiles = 5,
  label,
  onUpload,
  onUploadDone,
}: Props) {
  const [, setFiles] = useState<FileInfo[]>([]);

  const handleClick = () => {
    const picker = filestack.picker({
      accept: ['image/*'],
      maxFiles,
      onUploadDone: async (result: FilestackUploadResult) => {
        const uploaded = await Promise.all(
          result.filesUploaded.map(async (file: FilestackUploadedFile) => {
            let altText = '';

            try {
              const metaUrl = `https://cdn.filestackcontent.com/metadata/${file.handle}`;
              const res = await fetch(metaUrl);
              const meta = (await res.json()) as { alt_text?: string };
              altText = meta.alt_text || '';
            } catch (error) {
              console.warn(`Failed to fetch alt text for ${file.filename ?? file.handle}`, error);
            }

            return {
              url: file.url,
              alt: altText,
              width: file.width ?? 0,
              height: file.height ?? 0,
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

  return (
    <div>
      <button type="button" onClick={handleClick}>
        {label ?? `Upload ${name}`}
      </button>
    </div>
  );
}







