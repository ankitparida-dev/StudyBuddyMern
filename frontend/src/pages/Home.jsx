import React, { useEffect } from 'react';
import LoadingScreen from '../components/common/LoadingScreen';
import HeroSection from '../components/home/HeroSection';
import PersonalDiary from '../components/home/PersonalDiary';
import FeaturesSection from '../components/home/FeaturesSection';
import ChatAssistant from '../components/chat/ChatAssistant';
import { useLoading } from '../hooks/useLoading';
import '../styles/Home.css';

const Home = () => {
  const { isLoading, completeLoading } = useLoading();

  useEffect(() => {
    const timer = setTimeout(() => {
      completeLoading();
    }, 2000);

    return () => clearTimeout(timer);
  }, [completeLoading]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="home-page">
      <HeroSection />
      <PersonalDiary />
      <FeaturesSection />
      <ChatAssistant />
      
      {/* Scroll Spacer */}
      <div className="scroll-spacer"></div>
    </div>
  );
};

export default Home;