'use client';

import { useEffect } from 'react';

export default function UploaderPage() {
  useEffect(() => {
    // Load Filestack script dynamically (only on client)
    const script = document.createElement('script');
    script.src = 'https://static.filestackapi.com/filestack-js/3.x.x/filestack.min.js';
    script.async = true;
    script.onload = () => {
      const client = (window as any).filestack.init('Ac4UPEms0QsGVG6RBPstaz');
      (window as any).filestackClient = client; // store globally if needed
    };
    document.body.appendChild(script);
  }, []);

  const openPicker = () => {
    const client = (window as any).filestackClient;
    if (!client) return alert('Filestack not loaded yet');
    client.picker({
      onUploadDone: (res: any) => {
        const url = res.filesUploaded[0].url;
        alert('Image uploaded! URL copied to clipboard:\n' + url);
        navigator.clipboard.writeText(url);
      },
    }).open();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Upload Destination Image</h1>
      <button
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        onClick={openPicker}
      >
        Upload Image
      </button>
    </div>
  );
}
