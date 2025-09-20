const Square = ({ value, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100px',
        height: '100px',
        fontSize: '2em',
        fontWeight: 'bold',
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: disabled && !value ? '#f0f0f0' : '#fff',
        border: '2px solid #333'
      }}
    >
      {value}
    </button>
  );
};

export default Square;