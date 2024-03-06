import React, { useState, useEffect, useRef } from 'react';
import MusicPlayer from './MusicPlayer';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { selectCurrentTime, selectDuration } from '~/app/store/selectors/musicPlayerSelectors';

interface Question {
  timestamp: string;
  question: string;
}

interface Song {
  id?: number;
  r2Id: string;
  songTitle: string;
  genre: string;
  instruments: string;
  contribution: string;
  description: string;
  lyrics: string;
  presignedUrl: string;
  timedQuestions: Question[];
  endOfSongQuestions: string[];
  uploaderUserId: string;
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
  const [editableSong, setEditableSong] = useState<Song>({...song});
  const [newTimedQuestion, setNewTimedQuestion] = useState('');
  const [newEndOfSongQuestion, setNewEndOfSongQuestion] = useState('');
  const currentTime = useSelector(selectCurrentTime);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [selectedEndOfSongQuestionIndex, setSelectedEndOfSongQuestionIndex] = useState<number | null>(null);
  const timedQuestionRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const endOfSongQuestionRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (e.target instanceof HTMLSelectElement && e.target.multiple) {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setEditableSong(prev => ({ ...prev, [name]: selectedOptions }));
    } else {
      setEditableSong(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: string) => {
    const updatedQuestions = editableSong.timedQuestions.map((question, idx) => 
      idx === index ? { ...question, [field]: value } : question
    );
    setEditableSong({ ...editableSong, timedQuestions: updatedQuestions });
  };

  const handleEndOfSongQuestionChange = (index: number, value: string) => {
    setEditableSong(prev => {
      const updatedQuestions = [...prev.endOfSongQuestions];
      updatedQuestions[index] = value;
      return {
        ...prev,
        endOfSongQuestions: updatedQuestions,
      };
    });
  };

  const handleSave = () => {
    onSave(editableSong);
    onClose();
  };

  const handleAddTimedQuestion = () => {
    if (editableSong.timedQuestions.length >= 5) {
      toast.error('Too many timed questions');
      return;
    }
    const newQuestion = {
      timestamp: currentTime.toString(),
      question: newTimedQuestion,
    };
    setEditableSong(prev => ({
      ...prev,
      timedQuestions: [...prev.timedQuestions, newQuestion],
    }));
    setNewTimedQuestion('');
  };

  const handleAddEndOfSongQuestion = () => {
    if (editableSong.endOfSongQuestions.length >= 3) {
      toast.error('Too many end of song questions');
      return;
    }
    setEditableSong(prev => ({
      ...prev,
      endOfSongQuestions: [...prev.endOfSongQuestions, newEndOfSongQuestion],
    }));
    setNewEndOfSongQuestion('');
  };

  const handleDeleteTimedQuestion = (index: number) => {
    setEditableSong(prev => {
      const updatedQuestions = [...prev.timedQuestions];
      updatedQuestions.splice(index, 1);
      return {
        ...prev,
        timedQuestions: updatedQuestions,
      };
    });
  };

  const handleDeleteEndOfSongQuestion = (index: number) => {
    setEditableSong(prev => {
      const updatedQuestions = [...prev.endOfSongQuestions];
      updatedQuestions.splice(index, 1);
      return {
        ...prev,
        endOfSongQuestions: updatedQuestions,
      };
    });
  };
  

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm z-10">
      <div className="modal-content bg-white outline outline-4 w-3/4 p-5 rounded-lg outline outline-black outline-4 shadow-lg overflow-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black rounded-xl"><CloseIcon /></button>
        <h2 className="text-2xl font-bold mb-4 text-center text-black">Edit Song Details</h2>

        <div className="flex flex-wrap h-5/6 bg-neo-pink outline outline-4 outline-black p-4 rounded-lg mb-4">
          {/* Left Pane */}
          <div className="w-1/4 px-2 max-h-[calc(75vh-150px)] no-scrollbar overflow-y-visible	">
            {/* Song Title */}
            <div className="mb-2 bg-black px-2 py-2 rounded">
              <label className="block text-white text-sm font-bold mb-2">Song Title:</label>
              <input
                className="shadow appearance-none outline outline-3 outline-black rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                name="songTitle"
                value={editableSong.songTitle}
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
                value={editableSong.genre}
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
                value={editableSong.contribution}
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
                value={editableSong.instruments}
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
                value={editableSong.description}
                onChange={handleChange}
              />
            </div>

            {/* Lyrics */}
            <div className="bg-black px-2 py-1 rounded">
              <label className="block no-scrollbar text-white text-sm font-bold mb-2">Lyrics:</label>
              <textarea
                className="shadow appearance-none no-scrollbar outline outline-3 outline-black rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                name="lyrics"
                value={editableSong.lyrics}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Third Pane - Timed Questions */}
          <div className="w-1/4 px-2 overflow-auto max-h-[calc(75vh-150px)] no-scrollbar">
            <h3 className="text-lg font-bold mb-3 sticky top-1 bg-black text-white outline outline-white outline-3 text-center rounded z-10">Timed Questions</h3>
            {editableSong.timedQuestions.map((question, index) => (
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
                className={`bg-${editableSong.timedQuestions.length >= 5 ? 'gray-200 w-full outline outline-4 text-gray-400 outline-black cursor-not-allowed' : 'white w-full outline outline-4 outline-black text-black hover:bg-black hover:text-white'} font-bold py-2 px-4 rounded`}
                disabled={editableSong.timedQuestions.length >= 5}
              >
                Add Timed Question
              </button>
            </div>
          </div>

          {/* Fourth Pane - End of Song Questions */}
          <div className="w-1/4 px-2 overflow-auto max-h-[calc(75vh-150px)] no-scrollbar">
            <h3 className="text-lg font-bold sticky mb-3 sticky top-1 bg-black text-white outline outline-white outline-3 text-center rounded z-10">End of Song Questions</h3>
            {editableSong.endOfSongQuestions.map((question, index) => (
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
                className={`bg-${editableSong.endOfSongQuestions.length >= 3 ? 'gray-200 w-full outline outline-4 text-gray-400 outline-black cursor-not-allowed' : 'white w-full outline outline-4 outline-black text-black hover:bg-black hover:text-white'} font-bold py-2 px-4 rounded`}
                disabled={editableSong.endOfSongQuestions.length >= 3}
              >
                Add End of Song Question
              </button>
            </div>
          </div>
        </div>

        {/* Music Player and Buttons */}
        <div className="flex justify-between items-end mt-4">
          <MusicPlayer songUrl={editableSong.presignedUrl || ''} seekForwardDenial={false} />
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