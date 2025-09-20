import Square from './Square';

const Board = ({ board, onCellClick, disabled }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 100px)',
      gridTemplateRows: 'repeat(3, 100px)',
      gap: '5px',
      margin: '20px auto',
      width: '310px'
    }}>
      {board.map((value, index) => (
        <Square
          key={index}
          value={value}
          onClick={() => onCellClick(index)}
          disabled={disabled || value !== null}
        />
      ))}
    </div>
  );
};

export default Board;