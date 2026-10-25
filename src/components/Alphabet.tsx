import React from 'react';
import PronunciationButton from './PronunciationButton';
import { speak } from '../utils/speech';

interface AlphabetItemProps {
  letter: string;
  pronunciation: string;
  example: string;
  russianWord?: string;
  englishWord?: string;
  icon?: string;
}

interface AlphabetProps {
  data: AlphabetItemProps[];
}

const Alphabet: React.FC<AlphabetProps> = ({ data }) => {
  const handleBadgeSpeak = (word?: string) => {
    if (word) {
      speak(word, 'en-US', `badge-${word}`);
    }
  };

  return (
    <div className="section">
      <h2>English Alphabet & Phonics</h2>
      <div className="alphabet-container">
        {data.map((item, index) => (
          <div className="alphabet-card" key={index}>
            <div className="letter-container">
              <div className="letter-header">
                <div className="letter-pair">
                  <span className="letter-uppercase">{item.letter}</span>
                  <span className="letter-lowercase">{item.letter.toLowerCase()}</span>
                </div>
                <div className="pronunciation-button-wrapper">
                  <PronunciationButton 
                    text={item.letter.toLowerCase()} 
                    audioCategory="alphabet"
                    useLocalAudio={true}
                  />
                </div>
              </div>
              
              <div className="letter-underline"></div>
            </div>
            
            <div className="pronunciation">
              <strong>Pronunciation:</strong> <span className="pronunciation-text">{item.pronunciation} {item.example}</span>
            </div>
            
            {item.russianWord && (
              <div className="example">
                {item.icon && (
                  <button 
                    type="button"
                    className="example-icon-badge"
                    title={`Hear pronunciation for ${item.russianWord}`}
                    aria-label={`Pronounce ${item.russianWord}`}
                    onClick={() => handleBadgeSpeak(item.russianWord)}
                  >
                    {item.icon}
                  </button>
                )}
                <div className="example-details">
                  <div className="example-word-row">
                    <strong>Example:</strong>
                    <span className="example-word">{item.russianWord}</span> 
                    <PronunciationButton 
                      text={item.russianWord} 
                      className="example-pronunciation"
                      audioCategory="examples"
                      useLocalAudio={true}
                    />
                  </div>
                  {item.englishWord && (
                    <span className="example-translation">({item.englishWord})</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alphabet;