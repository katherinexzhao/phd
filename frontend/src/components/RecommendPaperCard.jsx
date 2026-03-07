import React, { useState } from "react";

export default function RecommendPaperCard({ paper, onLike, onSave, onComment }) {
  const [commentInput, setCommentInput] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const handleSubmit = () => {
    if (!commentInput.trim()) return;
    onComment({ text: commentInput, parentId: replyTo });
    setCommentInput("");
    setReplyTo(null);
  };

  const renderComments = (comments, parentId = null, level = 0) => {
    return comments
      .filter(c => c.parentId === parentId)
      .map(c => (
        <div key={c.id} className={`ml-${level * 4} mb-2 pl-2 border-l`}>
          <p className="text-sm">
            <strong>{c.author}:</strong> {c.text}
          </p>
          <button
            className="text-xs text-blue-500 hover:underline"
            onClick={() => setReplyTo(c.id)}
          >
            Reply
          </button>
          {renderComments(comments, c.id, level + 1)}
        </div>
      ));
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-1">{paper.title}</h2>
      <p className="text-sm text-gray-600 mb-1">By {paper.authors.join(", ")}</p>
      <p className="text-sm mb-2">{paper.abstract}</p>
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onLike} className="text-blue-600">
          {paper.liked ? "💙" : "🤍"} {paper.likeCount}
        </button>
        <button onClick={onSave} className="text-green-600">
          {paper.saved ? "✅ Saved" : "💾 Save"}
        </button>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-semibold mb-1">Comments:</h3>
        {renderComments(paper.comments)}
        <div className="mt-2 flex items-center gap-2">
          <input
            className="border rounded p-1 text-sm w-full"
            placeholder={replyTo ? "Replying..." : "Add a comment"}
            value={commentInput}
            onChange={e => setCommentInput(e.target.value)}
          />
          <button onClick={handleSubmit} className="text-sm bg-blue-500 text-white px-2 py-1 rounded">
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
