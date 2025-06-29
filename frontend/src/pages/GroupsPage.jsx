import React from "react";

export default function GroupsPage() {
  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow">
      <h2 className="text-3xl font-bold mb-4 text-gray-700">Groups</h2>
      <p className="mb-6 text-gray-700">
        Here you can join or create learning groups, collaborate with others, and share resources!
      </p>
      <ul className="space-y-4">
        <li className="p-4 bg-gray-50 rounded-lg shadow">
          <h3 className="text-xl font-semibold">AI Enthusiasts</h3>
          <p className="text-gray-600">Discuss the latest in artificial intelligence and machine learning.</p>
        </li>
        <li className="p-4 bg-gray-50 rounded-lg shadow">
          <h3 className="text-xl font-semibold">Language Learners</h3>
          <p className="text-gray-600">Practice and share tips for learning new languages.</p>
        </li>
        <li className="p-4 bg-gray-50 rounded-lg shadow">
          <h3 className="text-xl font-semibold">Study Buddies</h3>
          <p className="text-gray-600">Find partners for focused study sessions and accountability.</p>
        </li>
      </ul>
    </div>
  );
} 