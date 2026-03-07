import React, { useEffect, useState } from "react";
import RecommendPaperCard from "./RecommendPaperCard";

export default function RecommendedCarousel() {
  const [papers, setPapers] = useState([]);
  const savedTags = ["machine learning", "healthcare", "NLP"]; // 假设用户兴趣

  useEffect(() => {
    const mockPapers = [
      {
        id: "p1",
        title: "Large Language Models for Clinical Decision Support",
        authors: ["Smith J.", "Zhang A."],
        abstract: "LLMs can assist clinical decision-making from EHRs.",
        tags: ["healthcare", "LLM", "EHR"],
        liked: false,
        likeCount: Math.floor(Math.random() * 10),
        saved: false,
        comments: [
          { id: "c1", author: "Alice", text: "Interesting application of LLM in healthcare!", parentId: null },
          { id: "c2", author: "Bob", text: "I agree with @Alice, especially for real-time EHR updates.", parentId: "c1" },
          { id: "c3", author: "Charlie", text: "Any concerns about patient data privacy?", parentId: null }
        ]
      },
      {
        id: "p2",
        title: "Graph Neural Networks in Financial Fraud Detection",
        authors: ["Lee K.", "Chen B."],
        abstract: "GNNs detect patterns in financial fraud scenarios.",
        tags: ["graph neural network", "finance", "machine learning"],
        liked: false,
        likeCount: Math.floor(Math.random() * 10),
        saved: false,
        comments: []
      },
      {
        id: "p3",
        title: "Ethical Implications of AI in Medical Diagnosis",
        authors: ["Dr. Maria Lin", "Ahmed K."],
        abstract: "This paper explores the ethical concerns surrounding AI-driven diagnostic tools in modern healthcare systems.",
        tags: ["AI ethics", "healthcare", "diagnosis"],
        liked: false,
        likeCount: Math.floor(Math.random() * 10),
        saved: false,
        comments: [
          { id: "c4", author: "Dana", text: "Very important topic, especially with increasing LLM integration.", parentId: null },
          { id: "c5", author: "Evan", text: "Do you think doctors will fully trust AI?", parentId: "c4" },
          { id: "c6", author: "Fatima", text: "Bias in training data is my biggest concern.", parentId: null }
        ]
      },
      {
        id: "p4",
        title: "Personalized Learning with Recommendation Systems",
        authors: ["Nguyen T.", "Singh R."],
        abstract: "How recommender systems are shaping the future of personalized education.",
        tags: ["machine learning", "education", "recommendation"],
        liked: false,
        likeCount: Math.floor(Math.random() * 10),
        saved: false,
        comments: [
          { id: "c7", author: "Grace", text: "Exciting applications in EdTech!", parentId: null },
          { id: "c8", author: "Henry", text: "Reminds me of how Duolingo works.", parentId: "c7" }
        ]
      },
      {
        id: "p5",
        title: "Natural Language Processing for Legal Document Analysis",
        authors: ["Patel S.", "Williams D."],
        abstract: "NLP methods for improving efficiency in legal workflows.",
        tags: ["NLP", "legal tech", "machine learning"],
        liked: false,
        likeCount: Math.floor(Math.random() * 10),
        saved: false,
        comments: [
          { id: "c9", author: "Isla", text: "Legal NLP is such a niche but important area.", parentId: null }
        ]
      },
      {
        id: "p6",
        title: "Federated Learning in Mobile Health Applications",
        authors: ["Jin Y.", "Rahman F."],
        abstract: "Federated learning enables privacy-preserving collaboration in mobile health monitoring.",
        tags: ["federated learning", "healthcare", "privacy"],
        liked: false,
        likeCount: Math.floor(Math.random() * 10),
        saved: false,
        comments: [
          { id: "c10", author: "Liam", text: "Federated learning seems so promising!", parentId: null },
          { id: "c11", author: "Noah", text: "@Liam It’s ideal for sensitive medical data.", parentId: "c10" }
        ]
      },
      {
        id: "p7",
        title: "Reinforcement Learning for Autonomous Driving",
        authors: ["Kim Y.", "Patel R."],
        abstract: "Exploring the use of reinforcement learning in self-driving car technology.",
        tags: ["reinforcement learning", "autonomous driving", "AI"],
        liked: false,
        likeCount: Math.floor(Math.random() * 10),
        saved: false,
        comments: []
      }

    ];
    const filtered = mockPapers.filter(p =>
      p.tags.some(tag => savedTags.includes(tag))
    );

    setPapers([...filtered].sort(() => 0.5 - Math.random()).slice(0, 6)); // 精选6条
  }, []);

  if (papers.length === 0) return null;
  return (
    <div className="w-full max-w-6xl mt-16">
      <div className="flex justify-between items-center mb-4 px-2">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">📚 Recommended for You</h2>
          <p className="text-gray-500 text-sm">
            Based on your interests: {savedTags.join(", ")}
          </p>
        </div>
        <button className="text-sm text-blue-600 hover:underline">View All →</button>
      </div>

      <div className="overflow-x-auto flex gap-4 scroll-smooth scroll-pl-4 snap-x">
        {papers.map(paper => (
          <div
            key={paper.id}
            className="snap-start min-w-[320px] max-w-[320px] shrink-0"
          >
            <RecommendPaperCard paper={paper} simple />
          </div>
        ))}
      </div>
    </div>
  );
}