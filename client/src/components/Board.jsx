import Square from './Square';

const Board = ({ board, onCellClick, disabled, winningLine }) => {
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-2 mx-auto w-[310px]">
      {board.map((value, index) => (
        <Square
          key={index}
          value={value}
          onClick={() => onCellClick(index)}
          disabled={disabled || value !== null}
          isWinning={winningLine && winningLine.includes(index)}
        />
      ))}
    </div>
  );
};

export default Board;