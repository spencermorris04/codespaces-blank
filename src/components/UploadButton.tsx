import React from 'react';
import { useAuth } from "@clerk/nextjs";

interface UploadComponentProps {
  fileUUID: string;
}

const UploadComponent: React.FC<UploadComponentProps> = ({ fileUUID }) => {
  const { getToken } = useAuth();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!fileUUID) {
      alert('File UUID is not available. Please try again.');
      return;
    }

    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
  
      if (!file) {
        alert('Please select a file to upload.');
        return;
      }
  
      const token = await getToken();
  
      try {
        const response = await fetch(`/api/uploadR2`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ fileName: file.name, fileType: file.type, fileUUID: fileUUID }),
        });
  
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to get upload URL');
        }

        const { url } = data;
  
        // Uploading the file to Cloudflare R2 using the pre-signed URL
        const uploadResponse = await fetch(url, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`, // Include the token in the headers here
          },
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
    }
  };
  
  return (
    <div>
      <input type="file" accept=".mp3, .wav" onChange={handleFileChange} />
      <button>Upload File</button>
    </div>
  );
};

export default UploadComponent;
