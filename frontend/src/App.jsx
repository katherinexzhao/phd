import React from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignupPage.jsx'
import UploadOERPage from './pages/UploadOERPage'
import UploadOERMetaPage from './pages/UploadOERMetaPage'
import GroupsPage from './pages/GroupsPage'
import ChatbotPage from './pages/ChatbotPage'
import CompleteProfilePage from './pages/CompleteProfilePage'
import Layout from './pages/Layout'
import InterestSelect from './pages/InterestSelect'
import PersonalizedFormSteps from './pages/PersonalizedFormSteps'
import PersonalizedPlan from './pages/PersonalizedPlan'
import DayDetails from './pages/DayDetails.jsx'
import SearchResults from './pages/SearchResults';
import SavedPage from './pages/SavedPage';
import SavedPlans from './pages/SavedPlans'
function InterestPageWrapper() {
  const navigate = useNavigate();
  const handleSubmit = async (selectedInterests) => {
    const email = localStorage.getItem('email');
    try {
      await fetch('/api/user/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, interests: selectedInterests })
      });
    } catch (err) {
      // Optionally handle error
    }
    navigate('/home');
  };
  return <InterestSelect onSubmit={handleSubmit} />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/interest" element={<InterestPageWrapper />} />

        <Route path="/" element={<Layout />}>
          <Route path="home" element={<HomePage />} />
          <Route path="chatbot" element={<ChatbotPage />} />
          <Route path="groups" element={<GroupsPage />} />
          <Route path="forum" element={<div className='text-2xl'>Forum Page (TODO)</div>} />
          <Route path="profile" element={<CompleteProfilePage />} />
          <Route path="upload" element={<UploadOERPage />} />
          <Route path="upload/meta" element={<UploadOERMetaPage />} />
          <Route path="personalized" element={<PersonalizedFormSteps />} />
          <Route path="paper/:id" element={<DayDetails />} />
          <Route path="/search-results" element={<SearchResults />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="saved-plans" element={<SavedPlans />} />
        </Route>

        {/* Ensure the personalized-plan route is outside of Layout to avoid sidebar */}
        <Route path="/personalized-plan" element={<PersonalizedPlan />} />
      </Routes>
    </Router>
  )
}

export default App