import React, { useState } from 'react';
import MusicPlayer from './MusicPlayer';
import CloseIcon from '@mui/icons-material/Close'; // Ensure this is the correct path to your CloseIcon component
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify'; // Assuming react-toastify is correctly set up in your project
import { useSelector } from 'react-redux'; // Import useSelector hook from Redux to access the current timestamp
import { selectCurrentTime, selectDuration } from '~/app/store/selectors/musicPlayerSelectors';

interface Question {
  timestamp: string;
  question: string;
}

interface Song {
  id: number;
  songTitle: string;
  r2Id: string;
  presignedUrl?: string;
  uploaderUserId: string;
  genre: string[];
  instruments: string[];
  contribution: string[];
  description: string;
  lyrics: string;
  questions: Question[];
}

interface QuestionEditingModalProps {
  song: Song;
  onClose: () => void;
  onSave: (updatedSong: Song) => void;
}

const genres = ["Rock", "Jazz", "Classical", "Hip Hop", "Blues", "Country", "Metal"];
const instruments = ["Guitar", "Piano", "Drums", "Violin", "Bass", "Saxophone"];
const contributions = ["Songwriting", "Vocals", "Instrumentation", "Production", "Lyrics"];

const QuestionEditingModal: React.FC<QuestionEditingModalProps> = ({ song, onClose, onSave }) => {
  const [editableSong, setEditableSong] = useState<Song>({ ...song, questions: song.questions || [] });
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionTimestamp, setNewQuestionTimestamp] = useState('');

  // Use Redux useSelector hook to access the current timestamp from the music player
  const currentTime = useSelector(selectCurrentTime);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, index?: number, field?: string) => {
    if (index !== undefined && field) {
      const updatedQuestions = [...editableSong.questions];
      updatedQuestions[index][field] = e.target.value;
      setEditableSong(prev => ({ ...prev, questions: updatedQuestions }));
    } else {
      const { name, value } = e.target;
      if (e.target instanceof HTMLSelectElement && e.target.multiple) {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setEditableSong(prev => ({ ...prev, [name]: selectedOptions }));
      } else {
        setEditableSong(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleSave = () => {
    onSave(editableSong); // Pass the edited song back for saving
    onClose(); // Close the modal
  };

  const handleAddQuestion = () => {
    if (editableSong.questions.length >= 5) {
      toast.error('Too many timed questions');
      return;
    }
    const newQuestion = {
      timestamp: newQuestionTimestamp || currentTime.toString(),
      question: newQuestionText,
    };
    setEditableSong(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    setNewQuestionText('');
    setNewQuestionTimestamp('');
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm">
      <div className="modal-content bg-neo-pink outline outline-4 w-3/4 h-3/4 p-5 rounded-lg shadow-lg overflow-auto">
        <button onClick={onClose} className="absolute top-4 right-4"><CloseIcon /></button>
        <h2 className="text-xl font-bold mb-4">Edit Song Details</h2>

        <div className="flex">
          {/* Left Pane */}
          <div className="w-1/3">
            {/* Song Title */}
            <div className="mb-4">
              <label className="block text-black text-sm font-bold mb-2">Song Title:</label>
              <input
                className="shadow appearance-none outline outline-3 outline-black rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                name="songTitle"
                value={editableSong.songTitle}
                onChange={handleChange}
              />
            </div>

            {/* Genre */}
            <div className="mb-4">
              <label className="block text-black text-sm font-bold mb-2">Genre:</label>
              <select
                className="shadow no-scrollbar outline outline-3 outline-black rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                name="genre"
                multiple={true}
                value={editableSong.genre}
                onChange={handleChange}
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            {/* Contribution */}
            <div className="mb-4">
              <label className="block text-black text-sm font-bold mb-2">Contribution:</label>
              <select
                className="shadow no-scrollbar outline outline-3 outline-black rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                name="contribution"
                multiple={true}
                value={editableSong.contribution}
                onChange={handleChange}
              >
                {contributions.map(contribution => (
                  <option key={contribution} value={contribution}>{contribution}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Middle Pane */}
          <div className="w-1/3 ml-4 mr-4">
            {/* Instruments */}
            <div className="mb-4">
              <label className="block text-black text-sm font-bold mb-2">Instruments:</label>
              <select
                className="shadow no-scrollbar outline outline-3 outline-black rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                name="instruments"
                multiple={true}
                value={editableSong.instruments}
                onChange={handleChange}
              >
                {instruments.map(instrument => (
                  <option key={instrument} value={instrument}>{instrument}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block no-scrollbar text-black text-sm font-bold mb-2">Description:</label>
              <textarea
                className="shadow appearance-none outline outline-3 outline-black rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                name="description"
                value={editableSong.description}
                onChange={handleChange}
              />
            </div>

            {/* Lyrics */}
            <div className="mb-4">
              <label className="block no-scrollbar text-black text-sm font-bold mb-2">Lyrics:</label>
              <textarea
                className="shadow appearance-none outline outline-3 outline-black rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                name="lyrics"
                value={editableSong.lyrics}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Right Pane for Timed Questions */}
          <div className="w-1/3">
            <h3 className="text-lg font-bold mb-2">Timed Questions</h3>
            {editableSong.questions.map((question, index) => (
              <div key={index} className="mb-2 flex items-center">
                <input
                  className="shadow appearance-none outline outline-3 outline-black rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                  type="text"
                  placeholder="Timestamp"
                  value={question.timestamp}
                  onChange={(e) => handleChange(e, index, 'timestamp')}
                />
                <input
                  className="shadow appearance-none outline outline-3 outline-black rounded flex-grow py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                  placeholder="Question"
                  value={question.question}
                  onChange={(e) => handleChange(e, index, 'question')}
                />
              </div>
            ))}
            {editableSong.questions.length < 5 && (
              <div className="mt-4">
                <input
                  className="shadow appearance-none outline outline-3 outline-black rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                  type="text"
                  placeholder="New Question Text"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                />
                <input
                  className="shadow appearance-none outline outline-3 outline-black rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                  type="text"
                  placeholder="Timestamp (e.g., 00:30)"
                  value={newQuestionTimestamp}
                  onChange={(e) => setNewQuestionTimestamp(e.target.value)}
                />
                <button
                  onClick={handleAddQuestion}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add Question
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Music Player and Buttons */}
        <div className="flex justify-between items-end mt-4">
          <MusicPlayer songUrl={editableSong.presignedUrl || ''} seekForwardDenial={false}/>
          <div>
            <button onClick={onClose} className="ml-4 bg-white hover:bg-black text-black hover:text-white font-bold py-2 px-4 rounded-xl outline outline-4">Close</button>
            <button onClick={handleSave} className="ml-4 bg-white hover:bg-black text-black hover:text-white font-bold py-2 px-4 rounded-xl outline outline-4">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditingModal;