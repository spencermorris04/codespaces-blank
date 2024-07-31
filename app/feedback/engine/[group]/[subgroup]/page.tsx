"use client";

import { useState, useEffect, MouseEvent, ChangeEvent } from 'react';
import { useParams } from 'next/navigation';
import { Button, Form, Segment, TextArea, Input, Icon } from 'semantic-ui-react';

interface Question {
  text: string;
  type: string;
  annotations?: Annotation[];
  contentHtml?: string;
  answer?: string;
}

interface Annotation {
  text: string;
  comment: string;
  color: string;
  id: number;
}

interface GroupData {
  group: string;
  subgroups?: Subgroup[];
}

interface Subgroup {
  name: string;
  questions: Question[];
}

const colors = [
  '#FFD700', '#FF6347', '#ADFF2F', '#00BFFF', '#BA55D3', '#FF69B4', '#CD5C5C', '#FFA500', '#87CEEB', '#32CD32'
];

const findSubgroup = (groupData: GroupData | Subgroup, subgroupName: string): Subgroup | null => {
  if (isGroupData(groupData)) {
    if (!groupData.subgroups) return null;
    
    for (const subgroup of groupData.subgroups) {
      if (subgroup.name === subgroupName) {
        return subgroup;
      }
      const foundSubgroup = findSubgroup(subgroup, subgroupName);
      if (foundSubgroup) {
        return foundSubgroup;
      }
    }
  } else {
    // This is a Subgroup
    if (groupData.name === subgroupName) {
      return groupData;
    }
  }
  return null;
};

function isGroupData(data: GroupData | Subgroup): data is GroupData {
  return (data as GroupData).group !== undefined;
}


export default function FeedbackEngine() {
  const params = useParams();
  const { group, subgroup } = params as { group: string; subgroup: string };
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Partial<Question>>>({});
  const [questions, setQuestions] = useState<Record<string, GroupData[]> | null>(null);
  const [selectedAnnotationIndex, setSelectedAnnotationIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      const response = await fetch('/data/questions.json');
      const data: Record<string, GroupData[]> = await response.json();
      setQuestions(data);
    };

    fetchQuestions();
  }, []);

  const currentGroup = questions?.[group]?.find((g: GroupData) => g.group === group);
  const currentSubgroup = currentGroup ? findSubgroup(currentGroup, subgroup) : null;
  const currentQuestion = currentSubgroup?.questions[currentQuestionIndex];

  if (!currentGroup || !currentSubgroup) {
    return <div className="flex items-center justify-center h-screen text-xl text-red-500">Invalid group or subgroup</div>;
  }

  const handleAnswerChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswers = { ...answers };
    newAnswers[currentQuestion!.text] = {
      ...newAnswers[currentQuestion!.text],
      answer: e.target.value,
    };
    setAnswers(newAnswers);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || '';
    if (selectedText) {
      const newAnswers = { ...answers };
      const currentAnnotations = newAnswers[currentQuestion!.text]?.annotations || [];
      if (currentAnnotations.length < 10) {
        const color = colors[currentAnnotations.length % colors.length];
        const newAnnotation = { text: selectedText, comment: '', color, id: Date.now() };
        const range = selection!.getRangeAt(0);
        const mark = document.createElement('mark');
        mark.style.backgroundColor = color;
        mark.appendChild(range.extractContents());
        range.insertNode(mark);

        // Store the updated HTML content
        const contentHtml = document.getElementById('contentEditable')?.innerHTML || '';

        newAnswers[currentQuestion!.text] = {
          ...newAnswers[currentQuestion!.text],
          annotations: [...currentAnnotations, newAnnotation],
          contentHtml: contentHtml,
        };
        setAnswers(newAnswers);
        setSelectedAnnotationIndex(currentAnnotations.length);
      } else {
        alert('You can only create up to 10 annotations per question.');
      }
    }
  };

  const handleAnnotationChange = (index: number, comment: string) => {
    const currentAnnotations = answers[currentQuestion!.text]?.annotations;
    if (currentAnnotations) {
      currentAnnotations[index].comment = comment;
      const newAnswers = { ...answers };
      newAnswers[currentQuestion!.text] = {
        ...newAnswers[currentQuestion!.text],
        annotations: [...currentAnnotations],
      };
      setAnswers(newAnswers);
    }
  };

  const handleAnnotationClick = (index: number) => {
    setSelectedAnnotationIndex(index);
  };

  const handleDeleteAnnotation = (index: number) => {
    const currentAnnotations = answers[currentQuestion!.text]?.annotations;
    if (currentAnnotations) {
      const color = currentAnnotations[index].color;
      const updatedAnnotations = currentAnnotations.filter((_, i) => i !== index);
      const newAnswers = { ...answers };
      newAnswers[currentQuestion!.text] = {
        ...newAnswers[currentQuestion!.text],
        annotations: updatedAnnotations,
      };
      setAnswers(newAnswers);
      setSelectedAnnotationIndex(null);

      // Remove the highlight from the content
      const contentElement = document.getElementById('contentEditable');
      if (contentElement) {
        contentElement.innerHTML = contentElement.innerHTML.replace(
          new RegExp(`<mark style="background-color: ${color};">([^<]*)<\/mark>`, 'g'),
          '$1'
        );
        newAnswers[currentQuestion!.text].contentHtml = contentElement.innerHTML;
        setAnswers(newAnswers);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentSubgroup.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnnotationIndex(null);
    } else {
      // Ensure all questions have answers, even if blank
      currentSubgroup.questions.forEach((question: Question) => {
        if (!answers[question.text]) {
          answers[question.text] = { answer: '', annotations: [], contentHtml: '' };
        }
      });
      // Log the complete feedback to console (simulating API call)
      console.log('Feedback complete', {
        group,
        subgroup,
        answers,
      });
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnnotationIndex(null);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-4 bg-gray-100 overflow-hidden">
        <Segment className="h-full overflow-auto rounded-lg shadow-md">
          <div
            id="contentEditable"
            className="h-full p-4"
            contentEditable
            suppressContentEditableWarning
            onMouseUp={handleTextSelection}
            dangerouslySetInnerHTML={{ __html: answers[currentQuestion!.text]?.contentHtml || '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>' }} // This should be the screenplay content
          />
        </Segment>
      </div>
      <div className="flex-1 p-4 bg-white rounded-lg shadow-lg">
        {currentQuestion ? (
          <Form className="h-full flex flex-col justify-between">
            <Form.Field>
              <label className="text-lg font-semibold">{currentQuestion.text}</label>
              {currentQuestion.type === 'text' ? (
                <>
                  <TextArea
                    value={answers[currentQuestion.text]?.answer || ''}
                    onChange={handleAnswerChange}
                    placeholder="Provide your feedback here..."
                    className="mt-2 p-2 border border-gray-300 rounded-lg"
                  />
                  <Segment className="mt-2">
                    <p className="font-semibold">Annotations:</p>
                    {answers[currentQuestion.text]?.annotations?.map((annotation, index) => (
                      <div
                        key={annotation.id}
                        className={`bg-yellow-200 p-2 rounded-lg mb-2 ${selectedAnnotationIndex === index ? 'border border-blue-500' : ''}`}
                        onClick={() => handleAnnotationClick(index)}
                      >
                        <div className="flex justify-between items-center">
                          <p className="font-semibold">Text:</p>
                          <Button
                            icon
                            size="mini"
                            color="red"
                            onClick={(e: MouseEvent) => {
                              e.stopPropagation();
                              handleDeleteAnnotation(index);
                            }}
                          >
                            <Icon name="trash" />
                          </Button>
                        </div>
                        <p style={{ backgroundColor: annotation.color }}>{annotation.text}</p>
                        <Input
                          value={annotation.comment}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleAnnotationChange(index, e.target.value)}
                          placeholder="Add your comment here..."
                        />
                      </div>
                    ))}
                  </Segment>
                </>
              ) : (
                <div>Select the text (this needs implementation)</div>
              )}
            </Form.Field>
            <div className="flex justify-between mt-4">
              <Button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0} className="bg-blue-500 text-white py-2 px-4 rounded-lg">
                Previous
              </Button>
              <Button onClick={handleNextQuestion} className="bg-blue-500 text-white py-2 px-4 rounded-lg">
                Next
              </Button>
            </div>
          </Form>
        ) : (
          <div className="text-center text-lg">Loading questions...</div>
        )}
      </div>
    </div>
  );
}
