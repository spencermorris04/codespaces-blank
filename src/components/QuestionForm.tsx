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
        <label htmlFor="answer" className="block text-black text-xl font-bold mb-2 py-4">
          {question}
        </label>
        <textarea
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="shadow appearance-none border rounded-md w-full py-2 px-3 text-white bg-black h-[300px] leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-black hover:bg-white outline hover:outline-black outline-white text-white hover:text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        {isLastQuestion ? 'Submit Feedback' : 'Save Answer'}
      </button>
    </form>
  );
};

export default QuestionForm;