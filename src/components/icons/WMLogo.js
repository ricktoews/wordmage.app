const WMLogo = props => {
	const fill = props.fill || '#b889e8';

	return (
		<svg 
			className="wm-logo-icon" 
			onClick={props.onClick} 
			height="40px" 
			width="80px" 
			viewBox="0 0 80 40"
			style={{ 
				cursor: 'pointer',
				userSelect: 'none',
				display: 'inline-block',
				transform: 'scaleX(0.7)'
			}}
		>
			<text 
				x="50%" 
				y="50%" 
				dominantBaseline="middle" 
				textAnchor="middle" 
				fill={fill} 
				fontSize="40" 
				fontWeight="700"
				fontFamily="'Playfair Display SC', serif"
				letterSpacing="2"
			>
				WM
			</text>
		</svg>
	);
};

export default WMLogo;
