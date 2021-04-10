import React from 'react';
import '../App.scss';
import Clock from './Clock';
import Slider from './Slider';

function App() {
  return (
    <div className="app">
      <div className="header">Perseverance Picture Of the Day</div>
      <div className="container">
        <Slider></Slider>
      </div>
      <div className="footer">
        <Clock></Clock>
        <div className="copyright">
          <span>images from&nbsp;</span>
          <a href="https://mars.nasa.gov/mars2020/multimedia/raw-images/" target="_blank" rel="noreferrer noopener">
            Nasa Mars Perseverance Website
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
