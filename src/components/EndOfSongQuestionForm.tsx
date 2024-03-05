import React, { useState } from 'react';

interface Question {
  question: string;
}

interface EndOfSongQuestionFormProps {
  questions: Question[];
  onAnswersSubmit: (answers: { [key: string]: string }) => void;
}

const EndOfSongQuestionForm: React.FC<EndOfSongQuestionFormProps> = ({
  questions,
  onAnswersSubmit,
}) => {
  const [answers, setAnswers] = useState<{ [key: string]: string }>(
    questions.reduce((acc, q) => ({ ...acc, [q.question]: '' }), {})
  );

  const handleAnswerChange = (question: string, answer: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [question]: answer,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAnswersSubmit(answers);
    setAnswers(questions.reduce((acc, q) => ({ ...acc, [q.question]: '' }), {}));
  };

  return (
    <form onSubmit={handleSubmit}>
      {questions.map((q) => (
        <div key={q.question} className="mb-4">
          <label htmlFor={`answer-${q.question}`} className="block text-gray-700 text-sm font-bold mb-2">
            {q.question}
          </label>
          <textarea
            id={`answer-${q.question}`}
            value={answers[q.question]}
            onChange={(e) => handleAnswerChange(q.question, e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
      ))}
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Submit Feedback
      </button>
    </form>
  );
};

export default EndOfSongQuestionForm;