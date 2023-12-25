import React, { useState } from 'react';
import { useAuth } from "@clerk/nextjs";

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
}

const UploadFormComponent: React.FC<UploadFormProps> = ({ fileUUID, userId }) => {
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
    const target = e.target;
  
    // Check if the target is a select element and it's a multiple select
    if (target instanceof HTMLSelectElement && target.multiple) {
      const options = target.options;
      const value: string[] = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          value.push(options[i].value);
        }
      }
      setFormData({ ...formData, [target.name]: value });
    } else {
      setFormData({ ...formData, [target.name]: target.value });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = await getToken();

    // Use empty arrays as default values for multi-select fields
    const submissionData = {
      ...formData,
      genre: formData.genre.length > 0 ? formData.genre.join(', ') : [],
      instruments: formData.instruments.length > 0 ? formData.instruments.join(', ') : [],
      contribution: formData.contribution.length > 0 ? formData.contribution.join(', ') : [],
    };

    const response = await fetch('/api/uploadForm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(submissionData),
    });

    if (response.ok) {
      alert('Song submitted successfully');
    } else {
      alert('Error submitting song');
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      {/* Song Title Input */}
      <input 
        type="text" 
        placeholder="Song Title" 
        name="songTitle" 
        value={formData.songTitle} 
        onChange={handleChange}
      />

      {/* Genre Multi-Select */}
      <select name="genre" multiple value={formData.genre} onChange={handleChange}>
        <option value="Indie">Indie</option>
        <option value="Rock">Rock</option>
        <option value="Rap">Rap</option>
        <option value="Country">Country</option>
        <option value="Jazz">Jazz</option>
        <option value="Classical">Classical</option>
        {/* ...add more genres as needed */}
      </select>

      {/* Instruments Multi-Select */}
      <select name="instruments" multiple value={formData.instruments} onChange={handleChange}>
        <option value="Guitar">Guitar</option>
        <option value="Piano">Piano</option>
        <option value="Drums">Drums</option>
        <option value="Violin">Violin</option>
        <option value="Bass">Bass</option>
        <option value="Saxophone">Saxophone</option>
        {/* ...add more instruments as needed */}
      </select>

      {/* Contribution Multi-Select */}
      <select name="contribution" multiple value={formData.contribution} onChange={handleChange}>
        <option value="Songwriting">Songwriting</option>
        <option value="Vocals">Vocals</option>
        <option value="Instrumentation">Instrumentation</option>
        <option value="Production">Production</option>
        <option value="Lyrics">Lyrics</option>
        {/* ...add more contributions as needed */}
      </select>

      {/* Description Textarea */}
      <textarea 
        placeholder="Description" 
        name="description" 
        value={formData.description} 
        onChange={handleChange}
      />

      {/* Lyrics Textarea */}
      <textarea 
        placeholder="Lyrics" 
        name="lyrics" 
        value={formData.lyrics} 
        onChange={handleChange}
      />

      <input type="submit" value="Submit Song" />
    </form>

  );
};

export default UploadFormComponent;
