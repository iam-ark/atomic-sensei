import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const SearchResults = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [resources, setResources] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const query = new URLSearchParams(useLocation().search).get('q');

  useEffect(() => {
    if (query) {
      setIsLoading(true);
      setError(null);

      fetch(`http://localhost:8080/integrated/${query}`)
        .then(res => {
          if (!res.ok) throw new Error('Server response was not OK');
          return res.json();
        })
        .then(data => {
          if (data.roadmap && data.resources) {
            setRoadmap(data.roadmap);
            setResources(data.resources);
          } else {
            throw new Error('Invalid data format received');
          }
        })
        .catch(err => {
          console.error('Fetch error:', err);
          setError(err.message);
          setRoadmap(null);
          setResources(null);
        })
        .finally(() => setIsLoading(false));
    }
  }, [query]);

  return (
    <div>
      <h1>Search Results for "{query}"</h1>
      {isLoading ? (
        <p>Loading results...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <>
          {roadmap && (
            <div>
              <h2>Roadmap</h2>
              {Object.keys(roadmap).map(level => (
                <div key={level}>
                  <h3>{level.charAt(0).toUpperCase() + level.slice(1)}</h3>
                  <ul>
                    {roadmap[level].map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {resources && (
            <div>
              <h2>Resources</h2>
              {Object.keys(resources).map(level => (
                <div key={level}>
                  <h3>{level.charAt(0).toUpperCase() + level.slice(1)}</h3>
                  <h4>Articles</h4>
                  <ul>
                    {resources[level].articles.map((article, index) => (
                      <li key={index}>
                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                          {article.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <h4>Videos</h4>
                  <ul>
                    {resources[level].videos.map((video, index) => (
                      <li key={index}>
                        <a href={video.url} target="_blank" rel="noopener noreferrer">
                          {video.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;
