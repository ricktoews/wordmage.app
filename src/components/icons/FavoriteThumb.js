import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';

// Both states use the existing thumb's exact path; no additional icon package.
export default function FavoriteThumb({ filled }) {
    const [width, height, , , path] = faThumbsUp.icon;
    return <svg width="20" height="20" viewBox={`-16 -16 ${width + 32} ${height + 32}`} aria-hidden="true" focusable="false">
        <path d={path} fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'} strokeWidth="24" strokeLinejoin="round" />
    </svg>;
}
