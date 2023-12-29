import { currentUser } from "@clerk/nextjs";

export default async function HomePage() {
  const user = await currentUser();
  
  if (!user) return <div>Not logged in</div>;

  const feedbackTimeline = [
    {
      id: 1,
      content: 'Received positive feedback on',
      target: 'Summer Melody',
      date: 'Mar 10',
    },
    {
      id: 2,
      content: 'Gave constructive feedback on',
      target: 'Echoes of the Night',
      date: 'Mar 8',
    },
    {
      id: 3,
      content: 'Received mixed feedback on',
      target: 'City Lights',
      date: 'Mar 5',
    },
    // ... add more items as needed
  ];
  

  const leaderboard = [
    {
      name: 'Alex',
      points: 350,
      avatarUrl: 'https://cartoonavatar.com/wp-content/uploads/2022/01/Business-Avatar-On-Circle-Background.png',
    },
    {
      name: 'Jordan',
      points: 300,
      avatarUrl: 'https://cdn5.vectorstock.com/i/1000x1000/01/69/businesswoman-character-avatar-icon-vector-12800169.jpg',
    },
    {
      name: user?.firstName, // Replace with session user's name
      points: 250,
      avatarUrl: user?.imageUrl,
    },
    {
      name: 'Casey',
      points: 200,
      avatarUrl: 'https://cdn3.iconfinder.com/data/icons/avatars-collection/256/03-512.png',
    },
    {
      name: 'Taylor',
      points: 150,
      avatarUrl: 'https://cdn5.vectorstock.com/i/1000x1000/01/69/businesswoman-character-avatar-icon-vector-12800169.jpg',
    },
    {
      name: 'Sam',
      points: 120,
      avatarUrl: 'https://cdn3.iconfinder.com/data/icons/avatars-collection/256/03-512.png',
    },
    {
      name: 'Emily',
      points: 70,
      avatarUrl: 'https://cdn5.vectorstock.com/i/1000x1000/01/69/businesswoman-character-avatar-icon-vector-12800169.jpg',
    },
    {
      name: 'Richard',
      points: 40,
      avatarUrl: 'https://cdn3.iconfinder.com/data/icons/avatars-collection/256/03-512.png',
    },
    {
      name: 'Savannah',
      points: 10,
      avatarUrl: 'https://cdn5.vectorstock.com/i/1000x1000/01/69/businesswoman-character-avatar-icon-vector-12800169.jpg',
    },
    // ... add more items as needed
  ];
  

  const recentProjects = [
    {
      id: 'p1',
      title: 'Rainy Days',
      description: 'An acoustic journey through rain-soaked streets.',
    },
    {
      id: 'p2',
      title: 'Neon Dreams',
      description: 'A synthwave exploration.',
    },
    {
      id: 'p3',
      title: 'Mountain Echo',
      description: 'Folk-inspired melodies from the heart of nature.',
    },
    // ... add more items as needed
  ];

  return (
    <div className="grid grid-cols-3 gap-4 p-8 h-full">
      {/* Feedback Column */}
      <div className="col-span-1 bg-neo-light-pink p-6 rounded-lg outline outline-4  text-center text-2xl">
        <h2 className="text-xl font-bold mb-4">Recent Feedback</h2>
        <ul role="list" className="-mb-8">
          {feedbackTimeline.map((event, eventIdx) => (
            <li key={event.id}>
              <div className="relative pb-8">
                {eventIdx !== feedbackTimeline.length - 1 ? (
                  <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                ) : null}
                <div className="relative flex space-x-3">
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <p className="text-sm text-gray-500">
                      {event.content} <strong>{event.target}</strong>
                    </p>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      <time>{event.date}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Leaderboard Column */}
      <div className="col-span-1 bg-neo-light-pink p-6 rounded-lg outline outline-4">
        <h2 className=" font-bold mb-4 text-center text-2xl">Leaderboard</h2>
        <ol className="space-y-3">
          {leaderboard.map((entry, index) => (
            <li key={entry.name} className="flex items-center p-3 rounded-lg bg-white shadow-md outline outline-3">
              {/* Rank */}
              <span className={`text-xl font-bold mr-4 ${index < 3 ? 'text-green-500' : 'text-gray-500'} ${index > 5 ? 'text-red-500' : 'text-gray-500'}`}>{index + 1}</span>
              
              {/* Avatar - replace 'avatarUrl' with your actual image path */}
              <img src={
                entry.avatarUrl || '/default-avatar.png'} 
                alt={entry.name || 'User_Error'}
                className="w-10 h-10 rounded-full mr-3"
              />
              
              {/* Name */}
              <span className="flex-1 font-semibold">{entry.name}</span>
              
              {/* Points */}
              <span className="text-gray-500">{entry.points} XP</span>
            </li>
          ))}
        </ol>
      </div>


      {/* Projects Column */}
      <div className="col-span-1 bg-neo-light-pink p-6 rounded-lg outline outline-4">
        <h2 className=" font-bold mb-4 text-center text-2xl">Recent Projects</h2>
        <ul role="list" className="space-y-4">
          {recentProjects.map((project) => (
            <li key={project.id}>
              <div className="bg-white p-4 rounded-lg shadow outline outline-3">
                <h3 className="font-semibold">{project.title}</h3>
                <p className="text-sm text-gray-500">{project.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
