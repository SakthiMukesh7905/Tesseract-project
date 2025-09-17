export const issues = [
  {
    id: 101,
    desc: "Pothole on 5th Avenue",
    reporter: "user123",
    location: "Ward 7",
    lat: 12.9716,
    lng: 77.5946,
    date: "2025-09-15T10:20:00",
    media: true,
    type: "Road",
    status: "New",
    upvotes: 34,
    impact: 8
  },
  {
    id: 102,
    desc: "Broken streetlight",
    reporter: "jane_doe",
    location: "Ward 3",
    lat: 12.9720,
    lng: 77.5950,
    date: "2025-09-16T14:30:00",
    media: false,
    type: "Lighting",
    status: "In Progress",
    upvotes: 15,
    impact: 5
  },
  {
    id: 103,
    desc: "Garbage overflow",
    reporter: "alex_smith",
    location: "Ward 5",
    lat: 12.9700,
    lng: 77.5930,
    date: "2025-09-17T09:00:00",
    media: true,
    type: "Waste",
    status: "Completed",
    upvotes: 42,
    impact: 7
  },
  // Add more objects as needed (aim for 10-30 for a realistic demo)
];

export const posts = [
  {
    id: 1,
    text: "Streetlight still broken on Maple St!",
    upvotes: 52,
    comments: [
      { user: "Riya", text: "Been dark for weeks." },
      { user: "AdminBot", text: "We have escalated." }
    ]
  },
  {
    id: 2,
    text: "Need better waste management in Ward 5",
    upvotes: 28,
    comments: [
      { user: "Mike", text: "Agreed, it's overflowing!" }
    ]
  },
  // Add more posts...
];
