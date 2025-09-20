import { useState } from 'react';

const ShareGame = ({ gameId }) => {
  const [copied, setCopied] = useState(false);
  const gameLink = gameId;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(gameLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = gameLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'به بازی Tic-Tac-Toe بپیوندید',
          text: 'به بازی من بپیوندید!',
          url: gameLink,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      copyLink();
    }
  };

  return (
    <>
          <button 
            onClick={copyLink}
            style={{
              padding: '8px 16px',
              backgroundColor: copied ? '#28a745' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {copied ? 'کپی شد!' : 'کپی لینک'}
          </button>
          {navigator.share && (
            <button 
              onClick={shareLink}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              اشتراک‌گذاری
            </button>
          )}
    </>
  );
};

export default ShareGame;