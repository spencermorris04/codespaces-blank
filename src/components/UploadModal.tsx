"use client";
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '~/util/supabase/client';
import Modal from '@mui/material/Modal';
import { v4 as uuidv4 } from 'uuid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CloseIcon from '@mui/icons-material/Close';
import { redirect } from 'next/navigation';
import DeleteIcon from '@mui/icons-material/Delete';
import MusicPlayer from './MusicPlayer';
import { useSelector } from 'react-redux';
import { selectCurrentTime } from '~/app/store/selectors/musicPlayerSelectors';

interface UploadModalComponentProps {
  onClose: () => void;
  onFormSubmitted: () => void;
}

interface Question {
  timestamp: string;
  question: string;
}

interface Song {
  r2Id: string;
  uploaderUserId: string;
  songTitle: string;
  genre: string;
  instruments: string;
  contribution: string;
  description: string;
  lyrics: string;
  timedQuestions: Question[];
  endOfSongQuestions: string[];
}

const genres = ["Rock", "Jazz", "Classical", "Hip Hop", "Blues", "Country", "Metal"];
const instruments = ["Guitar", "Piano", "Drums", "Violin", "Bass", "Saxophone"];
const contributions = ["Songwriting", "Vocals", "Instrumentation", "Production", "Lyrics"];

const UploadModalComponent: React.FC<UploadModalComponentProps> = ({ onClose }) => {
  const [song, setSong] = useState<Song>({
    r2Id: '',
    uploaderUserId: '',
    songTitle: '',
    genre: '',
    instruments: '',
    contribution: '',
    description: '',
    lyrics: '',
    timedQuestions: [],
    endOfSongQuestions: [],
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(true);
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const [newTimedQuestion, setNewTimedQuestion] = useState('');
  const [newEndOfSongQuestion, setNewEndOfSongQuestion] = useState('');
  const currentTime = useSelector(selectCurrentTime);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [selectedEndOfSongQuestionIndex, setSelectedEndOfSongQuestionIndex] = useState<number | null>(null);
  const timedQuestionRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const endOfSongQuestionRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const [songUrl, setSongUrl] = useState<string>('');
  const [isMusicPlayerReady, setIsMusicPlayerReady] = useState(false);

  useEffect(() => {
    if (songUrl) {
      setIsMusicPlayerReady(true);
    }
  }, [songUrl]);

  useEffect(() => {
    async function fetchUserId() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        redirect('/login');
      } else {
        setUserId(data.user.id);
        setSong(prev => ({ ...prev, uploaderUserId: data.user.id }));
      }
    }

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchPresignedUrl = async () => {
      try {
        const response = await fetch(`/api/getPresignedUrl?fileUUID=${song.r2Id}`);
        const data = await response.json();
        if (response.ok) {
          setSongUrl(data.url);
        } else {
          console.error('Error fetching presigned URL:', data.error);
        }
      } catch (error) {
        console.error('Error fetching presigned URL:', error);
      }
    };

    if (song.r2Id) {
      fetchPresignedUrl();
    }
  }, [song.r2Id]);

  useEffect(() => {
    const updateTextareaHeight = (ref: HTMLTextAreaElement | null) => {
      if (ref) {
        ref.style.height = 'auto';
        ref.style.height = `${ref.scrollHeight}px`;
      }
    };

    const resetTextareaHeight = (ref: HTMLTextAreaElement | null) => {
      if (ref) {
        ref.style.height = 'auto';
      }
    };

    // Reset the height of all timed questions
    timedQuestionRefs.current.forEach(resetTextareaHeight);

    // Reset the height of all end of song questions
    endOfSongQuestionRefs.current.forEach(resetTextareaHeight);

    // Update the height of the selected timed question
    if (selectedQuestionIndex !== null) {
      updateTextareaHeight(timedQuestionRefs.current[selectedQuestionIndex]);
    }

    // Update the height of the selected end of song question
    if (selectedEndOfSongQuestionIndex !== null) {
      updateTextareaHeight(endOfSongQuestionRefs.current[selectedEndOfSongQuestionIndex]);
    }
  }, [selectedQuestionIndex, selectedEndOfSongQuestionIndex]);

  const handleClose = () => {
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
      setSong(prev => ({ ...prev, r2Id: generatedFileUUID }));
  
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
          setFileUploaded(true); // Indicate that the file has been uploaded
  
          // Fetch and set the presigned URL for the uploaded file
          const presignedResponse = await fetch(`/api/getPresignedUrl?fileUUID=${generatedFileUUID}`);
          const presignedData = await presignedResponse.json();
          if (presignedResponse.ok) {
            setSongUrl(presignedData.url);
            setIsMusicPlayerReady(true);
          } else {
            console.error('Error fetching presigned URL:', presignedData.error);
          }
        } else {
          toast.error('Upload failed.');
        }
      } catch (error) {
        console.error('Error during file upload:', error);
        toast.error('Error uploading file.');
      }
    }
  };
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (e.target instanceof HTMLSelectElement && e.target.multiple) {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setSong(prev => ({ ...prev, [name]: selectedOptions.join(', ') }));
    } else {
      setSong(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: string) => {
    const updatedQuestions = song.timedQuestions.map((question, idx) =>
      idx === index ? { ...question, [field]: value } : question
    );
    setSong({ ...song, timedQuestions: updatedQuestions });
  };

  const handleEndOfSongQuestionChange = (index: number, value: string) => {
    setSong(prev => {
      const updatedQuestions = [...prev.endOfSongQuestions];
      updatedQuestions[index] = value;
      return {
        ...prev,
        endOfSongQuestions: updatedQuestions,
      };
    });
  };

  const handleAddTimedQuestion = () => {
    if (song.timedQuestions.length >= 5) {
      toast.error('Too many timed questions');
      return;
    }
    const newQuestion = {
      timestamp: currentTime.toString(),
      question: newTimedQuestion,
    };
    setSong(prev => ({
      ...prev,
      timedQuestions: [...prev.timedQuestions, newQuestion],
    }));
    setNewTimedQuestion('');
  };

  const handleAddEndOfSongQuestion = () => {
    if (song.endOfSongQuestions.length >= 3) {
      toast.error('Too many end of song questions');
      return;
    }
    setSong(prev => ({
      ...prev,
      endOfSongQuestions: [...prev.endOfSongQuestions, newEndOfSongQuestion],
    }));
    setNewEndOfSongQuestion('');
  };

  const handleDeleteTimedQuestion = (index: number) => {
    setSong(prev => {
      const updatedQuestions = [...prev.timedQuestions];
      updatedQuestions.splice(index, 1);
      return {
        ...prev,
        timedQuestions: updatedQuestions,
      };
    });
  };

  const handleDeleteEndOfSongQuestion = (index: number) => {
    setSong(prev => {
      const updatedQuestions = [...prev.endOfSongQuestions];
      updatedQuestions.splice(index, 1);
      return {
        ...prev,
        endOfSongQuestions: updatedQuestions,
      };
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submissionData = {
      ...song,
      timedQuestions: JSON.stringify(song.timedQuestions),
      endOfSongQuestions: JSON.stringify(song.endOfSongQuestions),
    };

    try {
      const response = await fetch('/api/uploadForm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        toast.success('Song submitted successfully');
        onClose();
      } else {
        toast.error('Error submitting song');
      }
    } catch (error) {
      console.error('Error submitting song:', error);
      toast.error('Error submitting song');
    }
  };

  const handleSubmit = async () => {
    const submissionData = {
      ...song,
      timedQuestions: JSON.stringify(song.timedQuestions),
      endOfSongQuestions: JSON.stringify(song.endOfSongQuestions),
    };

    try {
      const response = await fetch('/api/uploadForm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        toast.success('Song submitted successfully');
        onClose();
      } else {
        toast.error('Error submitting song');
      }
    } catch (error) {
      console.error('Error submitting song:', error);
      toast.error('Error submitting song');
    }
  };

  return (
    <>
        <Modal
        open={open}
        onClose={(_, reason) => {
          if (reason !== 'backdropClick') {
            handleClose();
          }
        }}
        BackdropProps={{
          style: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
          },
        }}
        >
        <div
          className="modal-content bg-neo-light-pink outline outline-4"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'calc(80% - 40px)',
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
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontWeight: 'bold', fontSize: '24px' }}>Upload Form</h2>
            <button onClick={handleClose} style={{ border: 'none', background: 'none' }}>
              <CloseIcon style={{ fontSize: '24px', color: '#000' }} />
            </button>
          </div>
          {!fileUploaded && (
            <div className="mb-4">
              <input type="file" accept=".mp3, .wav" onChange={handleFileUpload} />
            </div>
          )}
          {song.r2Id && userId && fileUploaded && (
            <div className="p-4 bg-neo-pink outline outline-4 outline-black mt-6 rounded-lg shadow-md overflow-y-auto w-full max-h-3/4">
              <div className="flex flex-wrap h-5/6">
                {/* Left Pane */}
                <div className="w-1/4 px-2 max-h-[calc(75vh-150px)] no-scrollbar overflow-y-visible	">
                  {/* Song Title */}
                  <div className="mb-2 bg-black px-2 py-2 rounded">
                    <label className="block text-white text-sm font-bold mb-2">Song Title:</label>
                    <input
                      className="shadow appearance-none outline outline-3 outline-black rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                      name="songTitle"
                      value={song.songTitle}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Genre */}
                  <div className="mb-2 bg-black px-2 py-2 rounded">
                    <label className="block text-white text-sm font-bold">Genre:</label>
                    <select
                      className="shadow no-scrollbar outline outline-3 outline-black rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      name="genre"
                      multiple={true}
                      value={song.genre.split(', ')}
                      onChange={handleChange}
                    >
                      {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>

                  {/* Contribution */}
                  <div className="bg-black px-2 py-2 rounded">
                    <label className="block text-white text-sm font-bold mb-2">Contribution:</label>
                    <select
                      className="shadow no-scrollbar outline outline-3 outline-black rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      name="contribution"
                      multiple={true}
                      value={song.contribution.split(', ')}
                      onChange={handleChange}
                    >
                      {contributions.map(contribution => (
                        <option key={contribution} value={contribution}>{contribution}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Second Pane */}
                <div className="w-1/4 px-2 overflow-auto max-h-[calc(75vh-150px)] no-scrollbar">
                  {/* Instruments */}
                  <div className="mb-4 bg-black px-2 py-1 rounded">
                    <label className="block text-white text-sm font-bold mb-2">Instruments:</label>
                    <select
                      className="shadow no-scrollbar outline outline-3 outline-black rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      name="instruments"
                      multiple={true}
                      value={song.instruments.split(', ')}
                      onChange={handleChange}
                    >
                      {instruments.map(instrument => (
                        <option key={instrument} value={instrument}>{instrument}</option>
                      ))}
                    </select>
                  </div>

                {/* Description */}
                <div className="mb-4 bg-black px-2 py-1 rounded">
                  <label className="block no-scrollbar text-white text-sm font-bold mb-2">Description:</label>
                  <textarea
                    className="shadow appearance-none outline no-scrollbar outline-3 outline-black rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    name="description"
                    value={song.description}
                    onChange={handleChange}
                  />
                </div>

                {/* Lyrics */}
                <div className="bg-black px-2 py-1 rounded">
                  <label className="block no-scrollbar text-white text-sm font-bold mb-2">Lyrics:</label>
                  <textarea
                    className="shadow appearance-none no-scrollbar outline outline-3 outline-black rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    name="lyrics"
                    value={song.lyrics}
                    onChange={handleChange}
                  />
                </div>
                </div>

                {/* Third Pane - Timed Questions */}
                <div className="w-1/4 px-2 overflow-auto max-h-[calc(75vh-150px)] no-scrollbar">
                  <h3 className="text-lg font-bold mb-3 sticky top-1 bg-black text-white outline outline-white outline-3 text-center rounded z-10">Timed Questions</h3>
                  {song.timedQuestions.map((question, index) => (
                    <div key={index} className="mb-2 bg-black rounded outline outline-3 outline-black p-1 flex items-center" onClick={() => setSelectedQuestionIndex(index === selectedQuestionIndex ? null : index)}>
                      <input
                        className="shadow appearance-none rounded max-w-14 py-2 px-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                        type="text"
                        value={Number(question.timestamp).toFixed(2)}
                        readOnly
                      />
                      <textarea
                        ref={el => timedQuestionRefs.current[index] = el}
                        className={`shadow appearance-none outline outline-3 outline-black rounded no-scrollbar flex-grow py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none`}
                        value={question.question}
                        onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                        readOnly={selectedQuestionIndex !== index}
                        rows={1}
                      />
                      <button className="text-red-500" onClick={() => handleDeleteTimedQuestion(index)}>
                        <DeleteIcon />
                      </button>
                    </div>
                  ))}
                  <div className="mb-2">
                    <button
                      onClick={handleAddTimedQuestion}
                      className={`bg-${song.timedQuestions.length >= 5 ? 'gray-200 w-full outline outline-4 text-gray-400 outline-black cursor-not-allowed' : 'white w-full outline outline-4 outline-black text-black hover:bg-black hover:text-white'} font-bold py-2 px-4 rounded`}
                      disabled={song.timedQuestions.length >= 5}
                    >
                      Add Timed Question
                    </button>
                  </div>
                </div>

                {/* Fourth Pane - End of Song Questions */}
                <div className="w-1/4 px-2 overflow-auto max-h-[calc(75vh-150px)] no-scrollbar">
                  <h3 className="text-lg font-bold sticky mb-3 sticky top-1 bg-black text-white outline outline-white outline-3 text-center rounded z-10">End of Song Questions</h3>
                  {song.endOfSongQuestions.map((question, index) => (
                    <div key={index} className="mb-2 bg-black outline outline-3 outline-black rounded p-1 flex justify-between items-center">
                      <textarea
                        ref={el => endOfSongQuestionRefs.current[index] = el}
                        className={`shadow appearance-none no-scrollbar rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none`}
                        value={question}
                        onChange={(e) => handleEndOfSongQuestionChange(index, e.target.value)}
                        onClick={() => setSelectedEndOfSongQuestionIndex(index === selectedEndOfSongQuestionIndex ? null : index)}
                        rows={1}
                      />
                      <button className="text-red-500" onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEndOfSongQuestion(index);
                      }}>
                        <DeleteIcon />
                      </button>
                    </div>
                  ))}
                  <div className="">
                    <button
                      onClick={handleAddEndOfSongQuestion}
                      className={`bg-${song.endOfSongQuestions.length >= 3 ? 'gray-200 w-full outline outline-4 text-gray-400 outline-black cursor-not-allowed' : 'white w-full outline outline-4 outline-black text-black hover:bg-black hover:text-white'} font-bold py-2 px-4 rounded`}
                      disabled={song.endOfSongQuestions.length >= 3}
                    >
                      Add End of Song Question
                    </button>
                  </div>
                </div>
                </div>
            </div>
          )}
          {/* Music Player and Buttons */}
          <div className="flex justify-between items-center w-full mt-4">
          <MusicPlayer
            songUrl={isMusicPlayerReady ? songUrl : ''}
            seekForwardDenial={false}
            onTimestampReached={(timestamp, question) => {
              console.log(`Timed question reached at ${timestamp}: ${question}`);
            }}
            timedQuestions={song.timedQuestions}
            onEnded={() => {
              console.log('Song ended');
            }}
          />
            {/* Buttons */}
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={handleClose}
                className="bg-white hover:bg-black text-black hover:text-white font-bold py-2 px-4 rounded-xl outline outline-4 mr-4"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-white hover:bg-black text-black hover:text-white font-bold py-2 px-4 rounded-xl outline outline-4"
              >
                Submit
              </button>
            </div>
          </div>
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