import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function GroupsInfo() {
  const { groupId } = useParams();
  const [groupInfo, setGroupInfo] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Fetch group basic information
    axios.get(`/api/groups/${groupId}/info`)
      .then((res) => setGroupInfo(res.data))
      .catch((err) => console.error("Failed to fetch group info", err));

    // Fetch posts shared to this group
    axios.get(`/api/groups/${groupId}/shared-posts`)
      .then((res) => setPosts(res.data.posts))
      .catch((err) => console.error("Failed to fetch group posts", err));
  }, [groupId]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Group Info */}
      {groupInfo ? (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h1 className="text-2xl font-bold mb-1">{groupInfo.name}</h1>
          <p className="text-sm text-gray-600 mb-1">
            👥 {groupInfo.memberCount} member{groupInfo.memberCount !== 1 ? "s" : ""}
          </p>
          <p className="text-gray-700 mb-2">{groupInfo.description}</p>
          {groupInfo.rules && (
            <div className="text-sm text-gray-800 border-t pt-2 mt-2">
              <strong>Group Rules:</strong>
              <ul className="list-disc pl-5 text-gray-600">
                {groupInfo.rules.split('\n').map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500">Loading group information...</p>
      )}

      {/* Discussion Area */}
      <div>
        <h2 className="text-xl font-semibold mb-3">📢 Shared Posts</h2>
        {posts.length === 0 ? (
          <p className="text-gray-500">No posts have been shared to this group yet.</p>
        ) : (
          posts.map((post) => (
            <div key={post.postId} className="bg-white p-4 rounded shadow mb-4">
              <p className="text-gray-800">{post.content}</p>
              <p className="text-sm text-gray-500 mt-2">
                by {post.author} · {new Date(post.sharedAt).toLocaleString()}
              </p>
              {/* Future: Comment button / Expand comments */}
            </div>
          ))
        )}
      </div>
    </div>
  );
}