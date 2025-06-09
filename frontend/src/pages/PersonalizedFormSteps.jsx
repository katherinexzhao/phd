import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PersonalizedFormSteps = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    topic: '',
    goal: '',
    level: 'beginner',
    timeCommitment: '1-2 hours',
    learningStyle: 'visual',
    outputFormat: 'structured',
    additionalPreferences: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        topic: formData.topic,
        goal: formData.goal,
        expertise_level: formData.level,
        time_commitment: formData.timeCommitment,
        learning_style: formData.learningStyle,
        output_format: formData.outputFormat,
        additional_preferences: formData.additionalPreferences
      };
  
      const response = await fetch('http://localhost:8001/generate-plan/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) throw new Error('Failed to generate study plan');
  
      const data = await response.json();
      console.log("后端返回内容：", data);
      navigate('/personalized-plan', { state: { plan: data } });
    } catch (error) {
      console.error('Error generating study plan:', error);
      alert('Something went wrong while generating the study plan.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Step 1: What do you want to learn?</h2>
            <input name="topic" value={formData.topic} onChange={handleInputChange} className="w-full p-2 border rounded-md" placeholder="e.g., Machine Learning" required />
            <textarea name="goal" value={formData.goal} onChange={handleInputChange} className="w-full p-2 border rounded-md" placeholder="Your goal..." rows="3" required />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Step 2: Your Experience & Time</h2>
            <select name="level" value={formData.level} onChange={handleInputChange} className="w-full p-2 border rounded-md">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select name="timeCommitment" value={formData.timeCommitment} onChange={handleInputChange} className="w-full p-2 border rounded-md">
              <option value="1-2 hours">1-2 hrs/week</option>
              <option value="3-5 hours">3-5 hrs/week</option>
              <option value="5-10 hours">5-10 hrs/week</option>
              <option value="10+ hours">10+ hrs/week</option>
            </select>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Step 3: Learning Preferences</h2>
            <select name="learningStyle" value={formData.learningStyle} onChange={handleInputChange} className="w-full p-2 border rounded-md">
              <option value="visual">Visual</option>
              <option value="auditory">Auditory</option>
              <option value="reading">Reading/Writing</option>
              <option value="kinesthetic">Hands-on</option>
            </select>
            <select name="outputFormat" value={formData.outputFormat} onChange={handleInputChange} className="w-full p-2 border rounded-md">
              <option value="structured">Structured</option>
              <option value="flexible">Flexible</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Step 4: Additional Preferences</h2>
            <textarea name="additionalPreferences" value={formData.additionalPreferences} onChange={handleInputChange} className="w-full p-2 border rounded-md" rows="4" placeholder="e.g. I prefer videos, need practice exercises, etc." />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8 flex justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{step}</div>
            ))}
          </div>
          <form onSubmit={handleSubmit}>
            {renderStep()}
            <div className="mt-8 flex justify-between">
              {currentStep > 1 && (
                <button type="button" onClick={prevStep} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Previous</button>
              )}
              {currentStep < 4 ? (
                <button type="button" onClick={nextStep} className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Next</button>
              ) : (
                <button type="submit" className="ml-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Generate Study Plan</button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedFormSteps;

