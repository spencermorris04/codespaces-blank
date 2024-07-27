// app/feedback/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, Dropdown, Button } from 'semantic-ui-react';

// Types definitions
type FeedbackItem = {
  id: string;
  title: string;
  author: string;
  authorImage: string;
  group: string;
  subgroup: string;
};

type ScreenplayItem = {
  id: string;
  title: string;
  author: string;
  feedbackCount: number;
};

type FeedbackStats = {
  given: number;
  received: number;
};

type Option = {
  key: string;
  text: string;
  value: string;
};

const FeedbackDashboard: React.FC = () => {
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSubgroup, setSelectedSubgroup] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);

  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats>({ given: 0, received: 0 });
  const [givenFeedback, setGivenFeedback] = useState<FeedbackItem[]>([]);
  const [receivedFeedback, setReceivedFeedback] = useState<FeedbackItem[]>([]);
  const [topScreenplays, setTopScreenplays] = useState<ScreenplayItem[]>([]);
  const [groupOptions, setGroupOptions] = useState<Option[]>([]);
  const [subgroupOptions, setSubgroupOptions] = useState<{ [key: string]: Option[] }>({});

  useEffect(() => {
    const fetchData = async () => {
      const feedbackStatsResponse = await fetch('/data/feedbackStats.json');
      const feedbackStatsData = await feedbackStatsResponse.json();
      setFeedbackStats(feedbackStatsData);

      const givenFeedbackResponse = await fetch('/data/givenFeedback.json');
      const givenFeedbackData = await givenFeedbackResponse.json();
      setGivenFeedback(givenFeedbackData);

      const receivedFeedbackResponse = await fetch('/data/receivedFeedback.json');
      const receivedFeedbackData = await receivedFeedbackResponse.json();
      setReceivedFeedback(receivedFeedbackData);

      const topScreenplaysResponse = await fetch('/data/topScreenplays.json');
      const topScreenplaysData = await topScreenplaysResponse.json();
      setTopScreenplays(topScreenplaysData);

      const groupOptionsResponse = await fetch('/data/groupOptions.json');
      const groupOptionsData = await groupOptionsResponse.json();
      setGroupOptions(groupOptionsData);

      const subgroupOptionsResponse = await fetch('/data/subgroupOptions.json');
      const subgroupOptionsData = await subgroupOptionsResponse.json();
      setSubgroupOptions(subgroupOptionsData);
    };

    fetchData();
  }, []);

  const handleStartFeedback = () => {
    if (selectedGroup && selectedSubgroup) {
      router.push(`/feedback/engine/${selectedGroup}/${selectedSubgroup}`);
    }
  };

  const openFeedbackModal = (feedback: FeedbackItem) => {
    setSelectedFeedback(feedback);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-6xl">
        <h1 className="text-2xl font-bold mb-4">Feedback Dashboard</h1>
        <div className="flex justify-between mb-8">
          <div className="flex space-x-8">
            <div className="text-center">
              <div className="text-3xl font-semibold">{feedbackStats.given}</div>
              <div className="text-sm text-gray-600">Feedback Given</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-semibold">{feedbackStats.received}</div>
              <div className="text-sm text-gray-600">Feedback Received</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Feedback Given</h2>
            {givenFeedback.map((feedback) => (
              <div
                key={feedback.id}
                className="bg-gray-50 p-4 rounded-lg mb-4 cursor-pointer hover:bg-gray-100"
                onClick={() => openFeedbackModal(feedback)}
              >
                <div className="font-semibold">{feedback.title}</div>
                <div className="text-gray-600">by {feedback.author}</div>
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Feedback Received</h2>
            {receivedFeedback.map((feedback) => (
              <div
                key={feedback.id}
                className="bg-gray-50 p-4 rounded-lg mb-4 cursor-pointer hover:bg-gray-100"
                onClick={() => openFeedbackModal(feedback)}
              >
                <div className="font-semibold">{feedback.title}</div>
                <div className="text-gray-600">by {feedback.author}</div>
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Top Screenplays</h2>
            {topScreenplays.map((screenplay) => (
              <div
                key={screenplay.id}
                className="bg-gray-50 p-4 rounded-lg mb-4"
              >
                <div className="font-semibold">{screenplay.title}</div>
                <div className="text-gray-600">by {screenplay.author}</div>
                <div className="text-gray-400">({screenplay.feedbackCount} feedbacks)</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Start New Feedback</h2>
          <Dropdown
            placeholder="Select Feedback Group"
            fluid
            selection
            options={groupOptions}
            onChange={(_, { value }) => {
              setSelectedGroup(value as string);
              setSelectedSubgroup('');
            }}
          />
          {selectedGroup && (
            <Dropdown
              placeholder="Select Feedback Subgroup"
              fluid
              selection
              className="mt-4"
              options={subgroupOptions[selectedGroup]}
              onChange={(_, { value }) => setSelectedSubgroup(value as string)}
            />
          )}
          <Button
            primary
            className="mt-4"
            onClick={handleStartFeedback}
            disabled={!selectedGroup || !selectedSubgroup}
          >
            Start Feedback
          </Button>
        </div>
      </div>

      <Modal open={isModalOpen} onClose={() => setModalOpen(false)}>
        <Modal.Header>{selectedFeedback?.title}</Modal.Header>
        <Modal.Content>
          <div className="flex items-center mb-4">
            <img src={selectedFeedback?.authorImage} alt={selectedFeedback?.author} className="w-12 h-12 rounded-full mr-4" />
            <span>{selectedFeedback?.author}</span>
          </div>
          <p>Group: {selectedFeedback?.group}</p>
          <p>Subgroup: {selectedFeedback?.subgroup}</p>
          <p>Link to full screenplay: [Placeholder for screenplay link]</p>
          <div className="mt-4">
            <h4 className="font-semibold">Comments</h4>
            <p>[Placeholder for comments section]</p>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setModalOpen(false)}>Close</Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

export default FeedbackDashboard;
