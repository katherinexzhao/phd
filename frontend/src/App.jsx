import React from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignupPage.jsx'
import UploadOERPage from './pages/UploadOERPage'
import UploadOERMetaPage from './pages/UploadOERMetaPage'
import GroupsPage from './pages/GroupsPage.jsx'
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
import MyLearningDashboard from './pages/ MyLearningDashboard.jsx'
import PlanDetailPage from './pages/PlanDetailPage.jsx'
import GroupListPage from './pages/GroupListPage.jsx'
import GroupsInfo from './pages/GroupsInfo';
import MyResourcesPage from './pages/MyResourcesPage';
import ResourceDetailPage from './pages/ResourceDetailPage.jsx'
import EditResourcePage from './pages/EditResourcePage.jsx'
import RecommendHomePage from './pages/RecommendHomePage.jsx'
import CommunityPage from './pages/CommunityPage.jsx'
import ModeSelectionPage from './pages/ModeSelectionPage.jsx'
import ResearchHomePage from './pages/ResearchHomePage.jsx';
import PaperCard from './pages/PaperCardSearch.jsx'
import { API_BASE_URL } from "./api";
import {GoogleOAuthProvider} from "@react-oauth/google";
import SavedPapersByTopicPage from "./pages/SavedPapersByTopicPage";
import ExplainPaperPage from "./pages/ExplainPaperPage";
import LearningTopicDashboardPage from "./pages/LearningTopicDashboardPage";

function InterestPageWrapper() {
  const navigate = useNavigate();
  const handleSubmit = async (selectedInterests) => {
    const email = localStorage.getItem('email');
    try {
      await fetch(`${API_BASE_URL}/api/user/interests`, {
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
    <GoogleOAuthProvider clientId="391677112340-os318qhu7dpb5fb7asg1nd2qtesbjtr6.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/interest" element={<InterestPageWrapper />} />
          <Route path="/select-mode" element={<ModeSelectionPage />} />
          <Route path="/research" element={<ResearchHomePage />} />
          <Route path="/saved-papers-by-topic" element={<SavedPapersByTopicPage />} />
          <Route path="/explain-paper" element={<ExplainPaperPage />} />
          <Route path="/learning-topics" element={<LearningTopicDashboardPage />} />

          <Route path="/" element={<Layout />}>
            <Route path="home" element={<HomePage />} />
            <Route path="chatbot" element={<ChatbotPage />} />
            <Route path="forum" element={<div className='text-2xl'>Forum Page (TODO)</div>} />
            <Route path="profile" element={<CompleteProfilePage />} />
            <Route path="upload" element={<UploadOERPage />} />
            <Route path="upload/meta" element={<UploadOERMetaPage />} />
            <Route path="personalized" element={<PersonalizedFormSteps />} />
            <Route path="/personalized/plan" element={<PersonalizedPlan />} />
            <Route path="paper/:id" element={<DayDetails />} />
            <Route path="/search-results" element={<SearchResults />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="saved-plans" element={<SavedPlans />} />
            <Route path="/my-learning" element={<MyLearningDashboard />} />
            <Route path="/my-learning/plan/:planId" element={<PlanDetailPage/>} />
            <Route path="/plan-detail" element={<PlanDetailPage />} />
            <Route path="/groups" element={<GroupListPage />} />
            <Route path="/groups/:groupId" element={<GroupsInfo />} />
            <Route path="/my-resources" element={<MyResourcesPage />} />
            <Route path="/resource/:id" element={<ResourceDetailPage />} />
            <Route path="/resource/:resourceId/edit" element={<EditResourcePage />} />
            <Route path="/recommend-home" element={<RecommendHomePage />} />
            <Route path="/community" element={<CommunityPage />} />
            
            
          </Route>

          <Route path="/personalized-plan" element={<PersonalizedPlan />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  )
}

export default App