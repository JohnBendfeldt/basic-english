import React, { useState, useEffect } from 'react';
import { PhraseItem } from '../types/index';
import PronunciationButton from './PronunciationButton';
import { FaSyncAlt } from 'react-icons/fa';

interface PhraseCardProps {
  phrase?: string;
  meaning?: string;
  pronunciation: string;
  isRevealed: boolean;
  onToggleReveal: () => void;
  animationKey: number;
  contentType?: 'phrases' | 'words' | 'numbers';
  icon?: string;
}

const PhraseCard: React.FC<PhraseCardProps> = ({ 
  phrase,
  meaning,
  pronunciation, 
  isRevealed, 
  onToggleReveal,
  animationKey,
  contentType = 'phrases',
  icon
}) => {
  const targetPhrase = phrase || '';
  const definition = meaning || '';

  return (
    <div 
      className={`phrase-card ${isRevealed ? 'phrase-revealed' : 'phrase-hidden'}`} 
      key={`card-${animationKey}`}
    >
      <div className="phrase-header">
        <div className="phrase-title-group">
          {icon && (
            <span className="phrase-icon-badge" role="img" aria-hidden="true">
              {icon}
            </span>
          )}
          <h3 className="phrase-target phrase-text">{targetPhrase}</h3>
        </div>
        <PronunciationButton 
          text={targetPhrase} 
          label={`Pronounce ${contentType === 'words' ? 'word' : contentType === 'numbers' ? 'number' : 'phrase'} ${targetPhrase}`}
          className="phrase-pronunciation"
          audioCategory={contentType}
          useLocalAudio={true}
        />
      </div>
      <div className="phrase-content">
        {isRevealed ? (
          <div 
            className="phrase-revealed-wrap"
            role="button"
            tabIndex={0}
            aria-expanded={true}
            aria-label={`Hide translation for ${targetPhrase}`}
            onClick={onToggleReveal}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggleReveal();
              }
            }}
          >
            <div className="phrase-revealed-body">
              <p className="english phrase-definition">{definition}</p>
              <p className="pronunciation">
                <span className="pronunciation-label">Pronunciation:</span> {pronunciation}
              </p>
            </div>
            <div className="card-hide-cue">
              <FaSyncAlt className="cue-icon mini" aria-hidden="true" />
              <span>Tap to hide</span>
            </div>
          </div>
        ) : (
          <button 
            type="button"
            className="phrase-reveal-btn" 
            aria-expanded={false}
            aria-label={`Reveal translation for ${targetPhrase}`}
            onClick={onToggleReveal}
          >
            <FaSyncAlt className="cue-icon" aria-hidden="true" />
            <span>Tap to reveal</span>
          </button>
        )}
      </div>
    </div>
  );
};

interface PhrasesProps {
  data: PhraseItem[];
  title: string;
  contentType?: 'phrases' | 'words' | 'numbers';
}

const Phrases: React.FC<PhrasesProps> = ({ 
  data, 
  title,
  contentType = 'phrases'
}) => {
  const [revealedCards, setRevealedCards] = useState<boolean[]>(
    new Array(data.length).fill(false)
  );
  const [lastToggledCard, setLastToggledCard] = useState<number | null>(null);

  useEffect(() => {
    setRevealedCards(new Array(data.length).fill(false));
    setLastToggledCard(null);
  }, [data, title]);

  const toggleReveal = (index: number) => {
    const newRevealedCards = [...revealedCards];
    newRevealedCards[index] = !newRevealedCards[index];
    setRevealedCards(newRevealedCards);
    setLastToggledCard(index);
  };

  const allRevealed = revealedCards.length > 0 && revealedCards.every(Boolean);

  const toggleAll = () => {
    const nextState = !allRevealed;
    setRevealedCards(new Array(data.length).fill(nextState));
  };

  return (
    <div className="section">
      <div className="phrases-header-section">
        <h2>{title}</h2>
        <p className="phrases-subtitle">
          Tap any card to reveal its meaning and pronunciation
        </p>
        <div className="phrases-toggle-container">
          <button
            type="button"
            className="study-toggle-btn"
            onClick={toggleAll}
            aria-label={allRevealed ? `Hide all ${title.toLowerCase()}` : `Reveal all ${title.toLowerCase()}`}
          >
            <FaSyncAlt className={`toggle-btn-icon ${allRevealed ? 'rotated' : ''}`} aria-hidden="true" />
            <span>{allRevealed ? 'Hide All' : 'Reveal All'}</span>
          </button>
        </div>
      </div>

      <div className="phrases-container">
        {data.map((item, index) => (
          <PhraseCard 
            key={index}
            phrase={item.phrase}
            meaning={item.meaning}
            pronunciation={item.pronunciation}
            icon={item.icon}
            isRevealed={revealedCards[index]}
            onToggleReveal={() => toggleReveal(index)}
            animationKey={lastToggledCard === index ? Date.now() : index}
            contentType={contentType}
          />
        ))}
      </div>
    </div>
  );
};

export default Phrases;