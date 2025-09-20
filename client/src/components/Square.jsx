const Square = ({ value, onClick, disabled, isWinning }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-24 h-24 text-3xl font-bold border-2 border-gray-800 dark:border-gray-600 rounded-xl transition-all duration-300
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105 hover:shadow-lg'}
        ${isWinning ? 'bg-gray-300 dark:bg-gray-600' : 'bg-white dark:bg-gray-800'}
        ${value === 'X' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}
      `}
    >
      {value}
    </button>
  );
};

export default Square;