import Square from './Square';

const Board = ({ board, onCellClick, disabled, winningLine }) => {
  const getLineStyle = () => {
    if (!winningLine) return null;
    const [a, b, c] = winningLine;
    
    if ([0, 1, 2].includes(a)) {
      const row = Math.floor(a / 3);
      return {
        position: 'absolute',
        top: `${(row * 100) + 50}px`,
        right: '15px',
        width: '280px',
        height: '4px',
        backgroundColor: '#ff4757'
      };
    } else if ([3, 4, 5].includes(a)) {
      const row = Math.floor(a / 3);
      return {
        position: 'absolute',
        top: `${(row * 100) + 50}px`,
        right: '15px',
        width: '280px',
        height: '4px',
        backgroundColor: '#ff4757'
      };
    } else if ([6, 7, 8].includes(a)) {
      const row = Math.floor(a / 3);
      return {
        position: 'absolute',
        top: `${(row * 100) + 50}px`,
        right: '15px',
        width: '280px',
        height: '4px',
        backgroundColor: '#ff4757'
      };
    } else if ([0, 3, 6].includes(a)) {
      const col = a % 3;
      return {
        position: 'absolute',
        top: '15px',
        right: `${(col * 100) + 50}px`,
        width: '4px',
        height: '280px',
        backgroundColor: '#ff4757'
      };
    } else if ([1, 4, 7].includes(a)) {
      const col = a % 3;
      return {
        position: 'absolute',
        top: '15px',
        right: `${(col * 100) + 50}px`,
        width: '4px',
        height: '280px',
        backgroundColor: '#ff4757'
      };
    } else if ([2, 5, 8].includes(a)) {
      const col = a % 3;
      return {
        position: 'absolute',
        top: '15px',
        right: `${(col * 100) + 50}px`,
        width: '4px',
        height: '280px',
        backgroundColor: '#ff4757'
      };
    } else if (a === 0 && b === 4 && c === 8) {
      return {
        position: 'absolute',
        top: '15px',
        right: '15px',
        width: '280px',
        height: '4px',
        backgroundColor: '#ff4757',
        transform: 'rotate(45deg)',
        transformOrigin: '100% 0'
      };
    } else if (a === 2 && b === 4 && c === 6) {
      return {
        position: 'absolute',
        top: '15px',
        left: '15px',
        width: '280px',
        height: '4px',
        backgroundColor: '#ff4757',
        transform: 'rotate(-45deg)',
        transformOrigin: '0 0'
      };
    }
    return null;
  };

  return (
    <div className="relative grid grid-cols-3 grid-rows-3 gap-2 mx-auto w-[310px]">
      {board.map((value, index) => (
        <Square
          key={index}
          value={value}
          onClick={() => onCellClick(index)}
          disabled={disabled || value !== null}
          isWinning={winningLine && winningLine.includes(index)}
        />
      ))}
      {winningLine && (
        <div style={getLineStyle()} />
      )}
    </div>
  );
};

export default Board;