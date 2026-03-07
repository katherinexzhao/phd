import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PersonalizedFormSteps = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  // Prefill topic if coming from SavedPage
  useEffect(() => {
    const initialTag = location.state?.initialTag;
    if (initialTag) {
      setFormData(f => ({ ...f, topic: initialTag }));
    }
  }, [location.state]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const nextStep = () => setCurrentStep(s => s + 1);
  const prevStep = () => setCurrentStep(s => s - 1);

  const handleSubmit = async e => {
    e.preventDefault();

    // build payload for plan generation
    const payload = {
  topic: formData.topic,
  preferences: {
    expertise_level: formData.level,
    time_commitment: formData.timeCommitment,
    learning_style: formData.learningStyle,
    output_format: formData.outputFormat,
    additional_preferences: formData.additionalPreferences
  }
};

    try {
      // generate study plan from AI service
      const genRes = await fetch("http://127.0.0.1:5001/api/generate-plan/", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!genRes.ok) throw new Error(`Plan generation failed (${genRes.status})`);
      const plan = await genRes.json();

      // navigate to display page
      navigate('/personalized-plan', { state: { plan } });

      // navigate to display page
      navigate('/personalized-plan', { state: { plan } });
    } catch (err) {
      console.error('Error generating or saving plan:', err);
      alert('Something went wrong while generating your study plan. Please try again.');
    }
  };

  // render each step's form fields
  const renderStep = () => {
    const baseCls = 'w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400';
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-gray-800">Step 1: What do you want to learn?</h2>
            <input
              name="topic"
              value={formData.topic}
              onChange={handleInputChange}
              placeholder="e.g., Machine Learning"
              className={baseCls}
              required
            />
            <textarea
              name="goal"
              value={formData.goal}
              onChange={handleInputChange}
              placeholder="Your goal..."
              rows={3}
              className={baseCls}
              required
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-gray-800">Step 2: Your Experience & Time</h2>
            <select name="level" value={formData.level} onChange={handleInputChange} className={baseCls}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select name="timeCommitment" value={formData.timeCommitment} onChange={handleInputChange} className={baseCls}>
              <option value="1-2 hours">1–2 hrs/week</option>
              <option value="3-5 hours">3–5 hrs/week</option>
              <option value="5-10 hours">5–10 hrs/week</option>
              <option value="10+ hours">10+ hrs/week</option>
            </select>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-gray-800">Step 3: Learning Preferences</h2>
            <select name="learningStyle" value={formData.learningStyle} onChange={handleInputChange} className={baseCls}>
              <option value="visual">Visual</option>
              <option value="auditory">Auditory</option>
              <option value="reading">Reading/Writing</option>
              <option value="kinesthetic">Hands-on</option>
            </select>
            <select name="outputFormat" value={formData.outputFormat} onChange={handleInputChange} className={baseCls}>
              <option value="structured">Structured</option>
              <option value="flexible">Flexible</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-gray-800">Step 4: Additional Preferences</h2>
            <textarea
              name="additionalPreferences"
              value={formData.additionalPreferences}
              onChange={handleInputChange}
              placeholder="I prefer videos, need practice exercises, etc."
              rows={4}
              className={baseCls}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100 min-h-screen p-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-300 w-full max-w-2xl p-8 text-gray-800">
        {/* Progress Dots */}
        <div className="flex justify-between mb-8">
          {[1,2,3,4].map(step => (
            <div
              key={step}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-medium transition ${
                currentStep >= step
                  ? 'bg-black text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >{step}</div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {renderStep()}
          <div className="mt-8 flex justify-between items-center">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >Previous</button>
            )}
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="ml-auto px-5 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
              >Next</button>
            ) : (
              <button
                type="submit"
                className="ml-auto px-5 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
              >Generate Plan</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalizedFormSteps;