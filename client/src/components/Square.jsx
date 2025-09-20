const Square = ({ value, onClick, disabled, isWinning }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-20 h-20 md:w-24 md:h-24 text-3xl md:text-4xl font-bold rounded-xl transition-all duration-300
        border-2 border-gray-300 dark:border-gray-600
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105 hover:shadow-lg'}
        ${isWinning 
          ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-2xl scale-110 animate-pulse' 
          : (disabled && !value 
              ? 'bg-gray-100 dark:bg-gray-700' 
              : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
            )
        }
        ${value === 'X' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}
      `}
    >
      {value}
    </button>
  );
};

export default Square;