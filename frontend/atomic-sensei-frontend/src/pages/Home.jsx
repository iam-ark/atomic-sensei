import React from 'react';
import SearchBar from '../components/SearchBar';

const Home = () => {
  return (
    <div>
      <h1>Welcome to Atomic Sensei</h1>
      <p>Search for topics and get personalized roadmaps.</p>
      <SearchBar />
    </div>
  );
};

export default Home;
