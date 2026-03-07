import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function GroupDetail() {
  const { groupId } = useParams();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get(`/api/group/${groupId}/posts`)
      .then(res => {
        setPosts(res.data.posts);
      })
      .catch(err => {
        console.error('Failed to fetch posts', err);
      });
  }, [groupId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Posts in this Group</h2>
      {posts.map(post => (
        <div key={post.postId} className="bg-white shadow rounded-lg p-4 mb-4">
          <p className="text-gray-800">{post.content}</p>
          <div className="text-sm text-gray-500 mt-2">
            Posted by {post.author} on {new Date(post.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}