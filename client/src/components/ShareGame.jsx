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
    <div className="flex gap-2">
      <button 
        onClick={copyLink}
        className={`px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 ${
          copied 
            ? 'bg-green-500 text-white' 
            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
        }`}
      >
        {copied ? '✅ کپی شد' : '📋 کپی لینک'}
      </button>
      {navigator.share && (
        <button 
          onClick={shareLink}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
        >
          📤 اشتراک‌گذاری
        </button>
      )}
    </div>
  );
};

export default ShareGame;