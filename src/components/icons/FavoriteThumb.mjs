import React from 'react';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';

// Both states share the same thumb path across app and static landing pages.
export default function FavoriteThumb({ filled }) {
    const [width, height, , , path] = faThumbsUp.icon;
    return React.createElement('svg', { width: 20, height: 20, viewBox: `-16 -16 ${width + 32} ${height + 32}`, 'aria-hidden': true, focusable: false },
        React.createElement('path', { d: path, fill: filled ? 'currentColor' : 'none', stroke: filled ? 'none' : 'currentColor', strokeWidth: 24, strokeLinejoin: 'round' }));
}
