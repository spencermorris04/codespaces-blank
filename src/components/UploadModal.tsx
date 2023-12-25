import React, { useState } from 'react';
import { useAuth } from "@clerk/nextjs";
import Modal from '@mui/material/Modal';
import { v4 as uuidv4 } from 'uuid';
import UploadFormComponent from './UploadForm'; // Import FormUploadComponent

const UploadModalComponent = () => {
  const [fileUUID, setFileUUID] = useState<string>('');
  const { userId, getToken } = useAuth(); // Retrieve userId here

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (!file) {
        alert('Please select a file to upload.');
        return;
      }

      const token = await getToken();
      const generatedFileUUID = uuidv4(); // Generate UUID for the file
      setFileUUID(generatedFileUUID); // Update the state with the new UUID

      try {
        const response = await fetch(`/api/uploadR2`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ fileName: file.name, fileType: file.type, fileUUID: generatedFileUUID }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to get upload URL');
        }

        const { url } = data;

        // Uploading the file to Cloudflare R2 using the pre-signed URL
        const uploadResponse = await fetch(url, {
          method: 'PUT',
          body: file, // Removed 'Authorization' header
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
    <Modal open={true} onClose={() => {}}>
      <div className="modal-content" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '33%',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <input type="file" accept=".mp3, .wav" onChange={handleFileUpload} />
        {fileUUID && userId && <UploadFormComponent fileUUID={fileUUID} userId={userId} />} {/* Conditional rendering */}
      </div>
    </Modal>
  );
};

export default UploadModalComponent;
