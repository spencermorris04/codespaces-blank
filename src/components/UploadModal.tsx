"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '~/util/supabase/client';
import Modal from '@mui/material/Modal';
import { v4 as uuidv4 } from 'uuid';
import UploadFormComponent from './UploadForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CloseIcon from '@mui/icons-material/Close';
import { redirect } from 'next/navigation';

interface UploadModalComponentProps {
  onClose: () => void;
  onFormSubmitted: () => void;
}

const UploadModalComponent: React.FC<UploadModalComponentProps> = ({ onClose }) => {
  const [fileUUID, setFileUUID] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(true);
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);

  useEffect(() => {
    async function fetchUserId() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        redirect('/login');
      } else {
        setUserId(data.user.id);
      }
    }

    fetchUserId();
  }, []);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleFormSubmitted = () => {
    setOpen(false);
    onClose();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (!file) {
        toast.error('Please select a file to upload.');
        return;
      }

      const generatedFileUUID = uuidv4();
      setFileUUID(generatedFileUUID);

      try {
        const response = await fetch(`/api/uploadR2`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
          setFileUploaded(true);
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
      <Modal open={open} onClose={(_, reason) => {
        if (reason !== 'backdropClick') {
          handleClose();
        }
      }}>
          <div
          className="modal-content bg-neo-light-pink outline outline-4"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: '800px',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <button onClick={handleClose} className="self-end">
            <CloseIcon />
          </button>
          {!fileUploaded && (
            <div className="mb-4">
              <input type="file" accept=".mp3, .wav" onChange={handleFileUpload} />
            </div>
          )}
          {fileUUID && userId && fileUploaded && (
            <UploadFormComponent
              fileUUID={fileUUID}
              userId={userId}
              onClose={handleClose}
              onFormSubmitted={handleFormSubmitted}
            />
          )}
        </div>
      </Modal>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default UploadModalComponent;