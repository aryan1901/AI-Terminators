import React, { useState } from "react";
import "./TextToSpeech.css";



const TextToSpeechSection = () => {

  const [text, setText] = useState("");
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [language, setLanguage] = useState("en-US");

  //TextToSpeech
  const generateSpeech = () => {
  if (!text) return;

  const speech = new SpeechSynthesisUtterance(text);

speech.lang = language;
speech.rate = speed;
speech.pitch = pitch;

window.speechSynthesis.speak(speech);
};

  const handleSample = () => {
    setText("Artificial Intelligence is transforming the way we interact with technology.");
  };

  const handleClear = () => {
    setText("");
  };

  const handlePaste = async () => {
    const clipboard = await navigator.clipboard.readText();
    setText(clipboard);
  };

  return (
    <div className="tts-wrapper">

      {/* Top Controls */}
      <div className="tts-controls">

                    <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            >
            <option value="en-US">English</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
            </select>

        <select>
          <option>Female - Calm</option>
          <option>Male - Deep</option>
        </select>

        <select>
          <option>MP3</option>
          <option>WAV</option>
        </select>

       <button className="generate-btn" onClick={generateSpeech}>
  Generate
</button>

      </div>


      {/* Main Section */}
      <div className="tts-main">

        {/* Text Input */}
        <div className="tts-textbox">

          <h3>Text Input</h3>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text to convert into speech..."
          />

          <div className="text-actions">
            <button onClick={handleClear}>Clear</button>
            <button onClick={handleSample}>Sample Text</button>
            <button onClick={handlePaste}>Paste</button>
          </div>

        </div>


        {/* Audio Controls */}
        <div className="tts-audio">

          <h3>Audio Controls</h3>

          <label>Speed</label>
            <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
            />

          <label>Pitch</label>
            <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            />

            <button onClick={generateSpeech} className="preview-player">
            ▶ Preview Player
            </button>

          <div className="audio-buttons">
            <button className="download">Download</button>
            <button className="save">Save</button>
          </div>

        </div>

      </div>


      {/* Recent Audio */}
      <div className="recent-audio">
        <h3>Recent Audio</h3>
        <p>“Meeting summary...” • Voice: Female – Calm • Speed: 1.1x</p>
      </div>

    </div>
  );
};

export default TextToSpeechSection;