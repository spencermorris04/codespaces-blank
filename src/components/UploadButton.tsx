"use client";
import React, { useState } from 'react';
import { useAuth } from "@clerk/nextjs";

const UploadComponent: React.FC = () => {
  const { getToken } = useAuth();
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const token = await getToken();
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });

      const { url } = await response.json();

      // Uploading the file to Cloudflare R2 using the pre-signed URL
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: file,
      });

      if (uploadResponse.ok) {
        alert('File uploaded successfully!');
      } else {
        alert('Upload failed.');
      }
    } catch (error) {
      console.error('Error during file upload:', error);
      alert('Error uploading file.');
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadFile}>Upload File</button>
    </div>
  );
};

export default UploadComponent;