import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../api";

export default function GroupListPage() {
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [joinedGroups, setJoinedGroups] = useState([]);

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/groups`);
      setGroups(res.data.groups);
      // Check membership for all groups after fetching
      const userId = localStorage.getItem("userId");
      if (userId) {
        const checks = res.data.groups.map(group =>
          axios
            .get(`${API_BASE_URL}/api/groups/${group.id}/is-member`, { params: { userId } })
            .then(r => r.data.isMember ? group.id : null)
        );
        const results = await Promise.all(checks);
        setJoinedGroups(results.filter(Boolean));
      } else {
        setJoinedGroups([]);
      }
    } catch (err) {
      console.error("Failed to fetch groups", err);
    }
  };

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line
  }, []);
const handleJoin = async (groupId) => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert("You must be logged in to join a group.");
    return;
  }

  try {
    await axios.post(`${API_BASE_URL}/api/groups/${groupId}/join`, { userId });
    setJoinedGroups(prev => [...prev, groupId]); 
    alert("Joined group!");
  } catch (err) {
    console.error("Failed to join group", err);
    alert("Error joining group.");
  }
};
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/groups`, newGroup);
      setNewGroup({ name: "", description: "" });
      fetchGroups(); // 刷新列表
    } catch (err) {
      console.error("Failed to create group", err);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">All Study Groups</h1>

      {/* Create Group Form */}
      <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-2">Create a New Group</h2>
        <input
          type="text"
          placeholder="Group name"
          value={newGroup.name}
          onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
          className="w-full border p-2 rounded mb-2"
          required
        />
        <textarea
          placeholder="Group description"
          value={newGroup.description}
          onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
          className="w-full border p-2 rounded mb-2"
          required
        />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
          Create Group
        </button>
      </form>

      {/* Group List */}
      <div className="space-y-4">
        {groups.map(group => (
          <div
            key={group.id}
            className="bg-white p-4 rounded-lg shadow hover:bg-gray-50 transition flex flex-col justify-between"
          >
            <Link to={`/groups/${group.id}`} className="flex-grow">
              <h2 className="text-lg font-semibold">{group.name}</h2>
              <p className="text-sm text-gray-600">{group.description}</p>
              <p className="text-sm text-gray-500 mt-1">
                👥 {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
              </p>
            </Link>
            {!joinedGroups.includes(group.id) && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => handleJoin(group.id)}
                  className="text-gray-600 hover:text-gray-800 text-lg"
                  title="Join Group"
                >
                  <i className="fas fa-user-plus"></i>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}