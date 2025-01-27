"use client";
import React, { useEffect, useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { FeedbackActivity } from '../util/types/types';
import Link from 'next/link';

interface FeedbackActivityListProps {
  userId: string;
}

const FeedbackActivityList: React.FC<FeedbackActivityListProps> = ({ userId }) => {
  const [activities, setActivities] = useState<FeedbackActivity[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const response = await fetch('/api/getFeedbackActivity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    };

    fetchActivities();
  }, [userId]);

  return (
    <div className="bg-neo-light-pink p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Recent Feedback</h2>
      <ul role="list" className="-mb-8">
        {activities.map((activity, index) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {index !== activities.length - 1 ? (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
              ) : null}
              <div className="relative flex space-x-3">
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <p className="text-sm text-gray-500">
                    {activity.reviewerUserId === userId ? (
                      `You reviewed `
                    ) : (
                      <Link href={`/site/user/${activity.reviewerUserId}`}>
                        <div className="text-blue-600 hover:text-blue-800">{activity.reviewerUsername || 'Unknown User'}</div>
                      </Link>
                    )}
                    {` ${activity.songTitle} by `}
                    {activity.uploaderUserId === userId ? (
                      'you'
                    ) : (
                      <Link href={`/site/user/${activity.uploaderUserId}`}>
                        <div className="text-blue-600 hover:text-blue-800">{activity.uploaderUsername || 'Unknown User'}</div>
                      </Link>
                    )}
                  </p>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    <time dateTime={activity.timestamp}>{formatRelativeTime(activity.timestamp)}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

function formatRelativeTime(timestamp: string) {
  if (!timestamp) {
    return 'Unknown time';
  }

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export default FeedbackActivityList;
