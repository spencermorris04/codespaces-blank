import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import MusicPlayer from './MusicPlayer';
import { useSelector } from 'react-redux';
import { selectCurrentTime } from '~/app/store/selectors/musicPlayerSelectors';

interface FormData {
  r2Id: string;
  uploaderUserId: string;
  songTitle: string;
  genre: string[];
  instruments: string[];
  contribution: string[];
  description: string;
  lyrics: string;
  timedQuestions: { timestamp: string; question: string }[];
  endOfSongQuestions: string[];
}

interface UploadFormProps {
  fileUUID: string;
  userId: string;
  onClose: () => void; // Function to close the modal
  onFormSubmitted: () => void;
}

const UploadFormComponent: React.FC<UploadFormProps> = ({ fileUUID, userId, onClose, onFormSubmitted  }) => {
  const [formData, setFormData] = useState<FormData>({
    r2Id: fileUUID,
    uploaderUserId: userId,
    songTitle: '',
    genre: [],
    instruments: [],
    contribution: [],
    description: '',
    lyrics: '',
    timedQuestions: [],
    endOfSongQuestions: [],
  });
  const [newTimedQuestion, setNewTimedQuestion] = useState('');
  const [newEndOfSongQuestion, setNewEndOfSongQuestion] = useState('');
  const currentTime = useSelector(selectCurrentTime);
  const [songUrl, setSongUrl] = useState<string>(''); // Declare songUrl state

  useEffect(() => {
    const fetchPresignedUrl = async () => {
      try {
        const response = await fetch(`/api/getPresignedUrl?fileUUID=${fileUUID}`);
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

    fetchPresignedUrl();
  }, [fileUUID]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (e.target instanceof HTMLSelectElement && e.target.multiple) {
      const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
      setFormData({ ...formData, [name]: selectedOptions });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddTimedQuestion = () => {
    if (formData.timedQuestions.length >= 5) {
      toast.error('Maximum of 5 timed questions allowed');
      return;
    }
    setFormData({
      ...formData,
      timedQuestions: [...formData.timedQuestions, { timestamp: currentTime.toString(), question: newTimedQuestion }],
    });
    setNewTimedQuestion('');
  };

  const handleAddEndOfSongQuestion = () => {
    if (formData.endOfSongQuestions.length >= 3) {
      toast.error('Maximum of 3 end of song questions allowed');
      return;
    }
    setFormData({
      ...formData,
      endOfSongQuestions: [...formData.endOfSongQuestions, newEndOfSongQuestion],
    });
    setNewEndOfSongQuestion('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const submissionData = {
      ...formData,
      genre: formData.genre.join(', '),
      instruments: formData.instruments.join(', '),
      contribution: formData.contribution.join(', '),
      timedQuestions: JSON.stringify(formData.timedQuestions),
      endOfSongQuestions: JSON.stringify(formData.endOfSongQuestions),
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
        onFormSubmitted();
      } else {
        toast.error('Error submitting song');
      }
    } catch (error) {
      console.error('Error submitting song:', error);
      toast.error('Error submitting song');
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="max-w-6xl mx-auto p-4 bg-neo-pink mt-6 rounded-lg outline outline-4 shadow-md overflow-y-auto max-h-3/4">
      <div className="flex flex-wrap -mx-3">
        {/* Left Column */}
        <div className="w-full lg:w-1/4 px-3 mb-6">
          {/* Song Title Input */}
          <div className="mb-4">
            <label className="block text-black text-sm font-bold mb-2" htmlFor="songTitle">Song Title:</label>
            <input 
              id="songTitle"
              type="text" 
              placeholder="Song Title" 
              name="songTitle" 
              value={formData.songTitle} 
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight outline outline-2 focus:outline-3 focus:shadow-outline"
            />
          </div>

          {/* Genre Multi-Select */}
          <div className="mb-4">
            <label className="block text-black text-sm font-bold mb-2" htmlFor="genre">Genre:</label>
            <select 
              id="genre"
              name="genre" 
              multiple 
              value={formData.genre} 
              onChange={handleChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 outline outline-2  leading-tight focus:outline-3 focus:shadow-outline"
            >
              <option value="Rock">Rock</option>
              <option value="Jazz">Jazz</option>
              <option value="Classical">Classical</option>
              <option value="Hip Hop">Hip Hop</option>
              <option value="Blues">Blues</option>
              <option value="Country">Country</option>
              <option value="Metal">Metal</option>
            </select>
          </div>

          {/* Instruments Multi-Select */}
          <div className="mb-4">
            <label className="block text-black text-sm font-bold mb-2" htmlFor="instruments">Instruments:</label>
            <select 
              id="instruments"
              name="instruments" 
              multiple 
              value={formData.instruments} 
              onChange={handleChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight outline outline-2 focus:outline-3 focus:shadow-outline"
            >
              <option value="Guitar">Guitar</option>
              <option value="Piano">Piano</option>
              <option value="Drums">Drums</option>
              <option value="Violin">Violin</option>
              <option value="Bass">Bass</option>
              <option value="Saxophone">Saxophone</option>
            </select>
          </div>
        </div>

        {/* Second Column */}
        <div className="w-full lg:w-1/4 px-3 mb-6">
          {/* Contribution Multi-Select */}
          <div className="mb-4">
            <label className="block text-black text-sm font-bold mb-2" htmlFor="contribution">Contribution:</label>
            <select 
              id="contribution"
              name="contribution" 
              multiple 
              value={formData.contribution} 
              onChange={handleChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight outline outline-2 focus:outline-3 focus:shadow-outline"
            >
              <option value="Songwriting">Songwriting</option>
              <option value="Vocals">Vocals</option>
              <option value="Instrumentation">Instrumentation</option>
              <option value="Production">Production</option>
              <option value="Lyrics">Lyrics</option>
            </select>
          </div>

          {/* Description Textarea */}
          <div className="mb-4">
            <label className="block text-black text-sm font-bold mb-2" htmlFor="description">Description:</label>
            <textarea 
              id="description"
              placeholder="Description" 
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight outline outline-2 focus:outline-3 focus:shadow-outline"
            />
          </div>

          {/* Lyrics Textarea */}
          <div className="mb-4">
            <label className="block text-black text-sm font-bold mb-2" htmlFor="lyrics">Lyrics:</label>
            <textarea 
              id="lyrics"
              placeholder="Lyrics" 
              name="lyrics" 
              value={formData.lyrics} 
              onChange={handleChange}
              className="shadow appearance-none border outline outline-2 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-3"
            />
          </div>
        </div>

        {/* Third Column */}
        <div className="w-full lg:w-1/4 px-3 mb-6">
          <label className="block text-black text-sm font-bold mb-2">Timed Questions:</label>
          {formData.timedQuestions.map((question, index) => (
            <div key={index} className="mb-2">
              <input
                type="text"
                value={question.question}
                readOnly
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight outline outline-2 focus:outline-3 focus:shadow-outline"
              />
            </div>
          ))}
          {formData.timedQuestions.length < 5 && (
            <div className="mb-2">
              <input
                type="text"
                placeholder="New Timed Question"
                value={newTimedQuestion}
                onChange={(e) => setNewTimedQuestion(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight outline outline-2 focus:outline-3 focus:shadow-outline"
              />
              <button
                type="button"
                onClick={handleAddTimedQuestion}
                className="bg-black text-white hover:bg-white hover:text-black font-bold py-2 px-4 rounded focus:outline-2 mt-2"
              >
                Add Timed Question
              </button>
            </div>
          )}
        </div>

        {/* Fourth Column */}
        <div className="w-full lg:w-1/4 px-3 mb-6">
          <label className="block text-black text-sm font-bold mb-2">End of Song Questions:</label>
          {formData.endOfSongQuestions.map((question, index) => (
            <div key={index} className="mb-2">
              <input
                type="text"
                value={question}
                readOnly
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight outline outline-2 focus:outline-3 focus:shadow-outline"
              />
            </div>
          ))}
          {formData.endOfSongQuestions.length < 3 && (
            <div className="mb-2">
              <input
                type="text"
                placeholder="New End of Song Question"
                value={newEndOfSongQuestion}
                onChange={(e) => setNewEndOfSongQuestion(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight outline outline-2 focus:outline-3 focus:shadow-outline"
              />
              <button
                type="button"
                onClick={handleAddEndOfSongQuestion}
                className="bg-black text-white hover:bg-white hover:text-black font-bold py-2 px-4 rounded focus:outline-2 mt-2"
              >
                Add End of Song Question
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <MusicPlayer
          songUrl={songUrl}
          timedQuestions={formData.timedQuestions || []}
          seekForwardDenial = {false}
        />
      </div>

      <div className="flex justify-center mt-6">
        <button 
          type="submit" 
          className="bg-black text-white hover:bg-white hover:text-black font-bold py-2 px-4 rounded focus:outline-2"
        >
          Submit Song
        </button>
      </div>
    </form>
  );
};

export default UploadFormComponent;