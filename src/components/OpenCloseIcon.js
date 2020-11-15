const OpenCloseIcon = ({ onClick, style = {}, width = '20px', height = '15px', fill = 'red', className = '', viewBox = '0 0 300 300' }) => {
	return <svg 
	  onClick={onClick}
	  style={style}
	  width={width}
	  height={height}
	  viewBox={viewBox}
	  className={className}
	  xmlns="http://www.w3.org/2000/svg">
	    <polygon points="5,235 135,10 265,235" fill={fill} />
	  </svg>
};

export default OpenCloseIcon;
