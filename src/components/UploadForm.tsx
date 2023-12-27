import React, { useState } from 'react';
import { useAuth } from "@clerk/nextjs";
import { toast } from 'react-toastify';

interface FormData {
  r2Id: string;
  uploaderUserId: string;
  songTitle: string;
  genre: string[];
  instruments: string[];
  contribution: string[];
  description: string;
  lyrics: string;
}

interface UploadFormProps {
  fileUUID: string;
  userId: string;
  onClose: () => void; // Function to close the modal
}

const UploadFormComponent: React.FC<UploadFormProps> = ({ fileUUID, userId, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    r2Id: fileUUID,
    uploaderUserId: userId,
    songTitle: '',
    genre: [],
    instruments: [],
    contribution: [],
    description: '',
    lyrics: '',
  });

  const { getToken } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (e.target instanceof HTMLSelectElement && e.target.multiple) {
      const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
      setFormData({ ...formData, [name]: selectedOptions });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();

    const submissionData = {
      ...formData,
      genre: formData.genre.join(', '),
      instruments: formData.instruments.join(', '),
      contribution: formData.contribution.join(', ')
    };

    try {
      const response = await fetch('/api/uploadForm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        toast.success('Song submitted successfully');
        onClose(); // Close the modal
      } else {
        toast.error('Error submitting song');
      }
    } catch (error) {
      console.error('Error submitting song:', error);
      toast.error('Error submitting song');
    }
  };

  return (
<form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto p-4 bg-neo-pink mt-6 rounded-lg outline outline-4 shadow-md overflow-y-auto max-h-3/4">
  <div className="flex flex-wrap -mx-3">
    {/* Left Column */}
    <div className="w-full lg:w-1/2 px-3 mb-6">
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

    {/* Right Column */}
    <div className="w-full lg:w-1/2 px-3 mb-6">
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
