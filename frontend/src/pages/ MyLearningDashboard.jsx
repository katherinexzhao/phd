import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'; // ✅ 改成相对路径

import SavedPage from './SavedPage';
import SavedPlans from './SavedPlans';
import PersonalizedFormSteps from './PersonalizedFormSteps'; 
import MyResourcesPage from './MyResourcesPage';

export default function MyLearningDashboard() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📚 My Learning Dashboard</h1>

      <Tabs defaultValue="savedPapers" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="generatePlan">🧠 Generate New Plan</TabsTrigger>
          <TabsTrigger value="savedPapers">🔖 My Learning Materials</TabsTrigger>
          <TabsTrigger value="savedPlans">📅 My Plans</TabsTrigger>
          <TabsTrigger value="MyResourcesPage">📁 My Resources</TabsTrigger>

        </TabsList>

        <TabsContent value="generatePlan">
          <PersonalizedFormSteps />
        </TabsContent>

        <TabsContent value="savedPapers">
          <SavedPage />
        </TabsContent>

        <TabsContent value="savedPlans">
          <SavedPlans />
        </TabsContent>

        <TabsContent value="MyResourcesPage">
          <MyResourcesPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}