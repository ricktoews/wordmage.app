import React from 'react';
import snapshot from './landing-snapshot.json';
import { PublicContent as SharedContent } from './PublicContent.mjs';
export { PublicLinks, WordCards, EditorialMenu } from './PublicContent.mjs';
export function PublicContent(props) {
    const theme = props.page === '/rare-words' ? 'rare' : props.page === '/gothic-vocabulary' ? 'gothic' : null;
    return React.createElement(SharedContent, { ...props, landingWords: props.landingWords || (theme ? snapshot[theme].slice(0, theme === 'rare' ? 9 : 13) : undefined) });
}
