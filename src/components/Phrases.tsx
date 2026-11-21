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
  cardIndex: number;
  contentType?: 'phrases' | 'words' | 'numbers';
  icon?: string;
}

const PhraseCard: React.FC<PhraseCardProps> = ({ 
  phrase,
  meaning,
  pronunciation, 
  isRevealed, 
  onToggleReveal,
  cardIndex,
  contentType = 'phrases',
  icon
}) => {
  const targetPhrase = phrase || '';
  const definition = meaning || '';
  const detailsId = `phrase-details-${contentType}-${cardIndex}`;

  return (
    <div 
      className={`phrase-card ${isRevealed ? 'phrase-revealed' : 'phrase-hidden'}`}
    >
      <div className="phrase-header">
        <div className="phrase-title-group">
          {icon && (
            <span className="phrase-icon-badge" aria-hidden="true">
              {icon}
            </span>
          )}
          <h3 className="phrase-target phrase-text">{targetPhrase}</h3>
        </div>
        <PronunciationButton 
          text={targetPhrase} 
          label={`Pronounce ${contentType === 'words' ? 'word' : contentType === 'numbers' ? (/\?|\bo'clock\b|\bpast\b|\bto\b/i.test(targetPhrase) ? 'phrase' : 'number') : 'phrase'} ${targetPhrase}`}
          className="phrase-pronunciation"
          audioCategory={contentType}
          useLocalAudio={true}
        />
      </div>
      <div className="phrase-content">
        <div
          id={detailsId}
          className="phrase-live-region"
          aria-live="polite"
        >
          {isRevealed && (
            <div 
              className="phrase-revealed-wrap"
              onClick={onToggleReveal}
            >
              <div className="phrase-revealed-body">
                <p className="english phrase-definition">{definition}</p>
                <p className="pronunciation">
                  <span className="pronunciation-label">Pronunciation:</span> {pronunciation}
                </p>
              </div>
            </div>
          )}
        </div>
        <button 
          type="button"
          className={isRevealed ? 'card-hide-cue phrase-toggle-btn' : 'phrase-reveal-btn phrase-toggle-btn'}
          aria-expanded={isRevealed}
          aria-controls={detailsId}
          aria-label={
            isRevealed
              ? `Hide translation for ${targetPhrase}`
              : `Reveal translation for ${targetPhrase}`
          }
          onClick={onToggleReveal}
        >
          <FaSyncAlt className={isRevealed ? 'cue-icon mini' : 'cue-icon'} aria-hidden="true" />
          <span>{isRevealed ? 'Tap to hide' : 'Tap to reveal'}</span>
        </button>
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

  useEffect(() => {
    setRevealedCards(new Array(data.length).fill(false));
  }, [data, title]);

  const toggleReveal = (index: number) => {
    setRevealedCards((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
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
            aria-pressed={allRevealed}
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
            key={item.phrase ? `${contentType}-${item.phrase}` : index}
            phrase={item.phrase}
            meaning={item.meaning}
            pronunciation={item.pronunciation}
            icon={item.icon}
            isRevealed={Boolean(revealedCards[index])}
            onToggleReveal={() => toggleReveal(index)}
            cardIndex={index}
            contentType={contentType}
          />
        ))}
      </div>
    </div>
  );
};

export default Phrases;