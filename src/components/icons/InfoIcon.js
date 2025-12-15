const InfoIcon = props => {
	const fill = props.fill || '#666';

	return (
		<svg 
			className="info-icon" 
			onClick={props.onClick} 
			height="20px" 
			width="20px" 
			viewBox="0 0 20 20"
			style={{ cursor: 'pointer' }}
		>
			<circle cx="10" cy="10" r="9" fill="none" stroke={fill} strokeWidth="1.5"/>
			<text 
				x="50%" 
				y="50%" 
				dominantBaseline="middle" 
				textAnchor="middle" 
				fill={fill} 
				fontSize="14" 
				fontWeight="600"
				fontFamily="Georgia, serif"
				dy="0.5"
			>
				i
			</text>
		</svg>
	);
};

export default InfoIcon;
