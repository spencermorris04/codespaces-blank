import React, { useState } from 'react';

interface QuestionFormProps {
  question: string;
  onAnswerSubmit: (answer: string) => void;
  isLastQuestion: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  onAnswerSubmit,
  isLastQuestion,
}) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAnswerSubmit(answer);
    setAnswer('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="answer" className="block text-gray-700 text-sm font-bold mb-2">
          {question}
        </label>
        <textarea
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        {isLastQuestion ? 'Submit Feedback' : 'Next Question'}
      </button>
    </form>
  );
};

export default QuestionForm;