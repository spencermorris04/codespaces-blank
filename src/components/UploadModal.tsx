import React, { useState, useCallback } from 'react';
import { useAuth } from "@clerk/nextjs";
import Modal from '@mui/material/Modal';
import { v4 as uuidv4 } from 'uuid';
import UploadFormComponent from './UploadForm'; // Import UploadFormComponent
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CloseIcon from '@mui/icons-material/Close';

interface UploadModalComponentProps {
  onClose: () => void;  // Define the type for the onClose prop
}

const UploadModalComponent: React.FC<UploadModalComponentProps> = ({ onClose }) => {
  const [fileUUID, setFileUUID] = useState<string>('');
  const [open, setOpen] = useState<boolean>(true);
  const { userId, getToken } = useAuth();

  const handleClose = () => {
    onClose(); // Use the passed onClose function to sync state
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (!file) {
        toast.error('Please select a file to upload.');
        return;
      }

      const token = await getToken();
      const generatedFileUUID = uuidv4();
      setFileUUID(generatedFileUUID);

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
        const uploadResponse = await fetch(url, {
          method: 'PUT',
          body: file,
        });

        if (uploadResponse.ok) {
          toast.success('File uploaded successfully!');
        } else {
          toast.error('Upload failed.');
        }
      } catch (error) {
        console.error('Error during file upload:', error);
        toast.error('Error uploading file.');
      }
    }
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <div className="modal-content bg-neo-light-pink outline outline-4" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '33%',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <button onClick={handleClose} className="self-end">
            <CloseIcon />
          </button>
          <input type="file" accept=".mp3, .wav" onChange={handleFileUpload} />
          {fileUUID && userId && <UploadFormComponent fileUUID={fileUUID} userId={userId} onClose={handleClose} />} 
        </div>
      </Modal>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
};

export default UploadModalComponent;
