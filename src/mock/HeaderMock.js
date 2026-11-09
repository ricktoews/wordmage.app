import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom, faGlasses, faThumbsUp, faFolderOpen, faShareNodes, faUser, faBars, faRotate, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { PublicContent } from '../public-content/PublicContent';
import vocabulary from '../public-content/words.mjs';
import snapshot from '../public-content/landing-snapshot.json';
import './header-mock.css';

const shortcuts = [
    ['Random', faRandom], ['Browse', faGlasses], ['Favorites', faThumbsUp], ['Albums', faFolderOpen]
];
const samples = ['apricity', 'velleity', 'quiddity', 'luculent', 'fugacious', 'abderian'];
const sampleWords = samples.map(name => vocabulary.find(word => word.word === name)).filter(Boolean);

export default function HeaderMock({ user }) {
    const [view, setView] = useState('Random');
    const [menu, setMenu] = useState(false);
    const [offset, setOffset] = useState(0);
    const [notice, setNotice] = useState('');
    const isLanding = view === 'Rare Words' || view === 'Gothic Words';
    const route = view === 'Rare Words' ? '/rare-words' : '/gothic-vocabulary';
    const theme = view === 'Rare Words' ? 'rare' : 'gothic';
    const pool = snapshot[theme];
    const landingWords = [...pool.slice(offset % pool.length), ...pool.slice(0, offset % pool.length)].slice(0, theme === 'rare' ? 9 : 13);
    const featured = sampleWords[offset % sampleWords.length];
    const words = sampleWords.filter(word => word.id !== featured.id);

    useEffect(() => {
        const close = event => {
            if (event.key === 'Escape') {
                setMenu(false); setNotice('');
                document.querySelector('.wm-mock-menu-toggle')?.focus();
            }
        };
        document.addEventListener('keydown', close);
        return () => document.removeEventListener('keydown', close);
    }, []);
    function select(next) {
        setView(next); setMenu(false); setNotice(''); window.scrollTo(0, 0);
    }

    return <div className="wm-mock">
        <div className="wm-mock-brandbar">
            <div className="wm-mock-brandbar-inner">
                <button type="button" className="wm-mock-menu-toggle" aria-label="Open navigation menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
                    <FontAwesomeIcon icon={faBars} />
                </button>
                <a className="wm-mock-wordmark" href="/" aria-label="WordMage home">
                    <img src="/images/wordmage-logo.png" alt="" width="32" height="36" />
                    <span>WordMage</span>
                </a>
                <button type="button" className="wm-mock-account" aria-label="Account" onClick={() => setNotice('Account')}>
                    {user?.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <FontAwesomeIcon icon={faUser} />}
                </button>
            </div>
        </div>
        <nav className="wm-mock-shortcuts" aria-label="Quick navigation">
            {shortcuts.map(([label, icon]) => <button type="button" key={label} title={label} aria-label={label} aria-current={view === label ? 'page' : undefined} onClick={() => select(label)}>
                <FontAwesomeIcon icon={icon} />
            </button>)}
            <span className="wm-mock-nav-divider" />
            <button type="button" title="Share WordMage" aria-label="Share WordMage" onClick={() => setNotice('Share WordMage')}><FontAwesomeIcon icon={faShareNodes} /></button>
        </nav>

        {isLanding ? <div className="wm-mock-landing"><PublicContent page={route} landingWords={landingWords} onRefresh={() => setOffset(value => value + 1)} onMenuToggle={() => setMenu(true)} menuOpen={menu} /></div> :
            <main className="wm-mock-interior">
                <div className="wm-mock-page-heading">
                    <h1>{view} <span aria-hidden="true">❧</span></h1>
                    <button type="button" className="wm-mock-refresh" aria-label="Refresh preview words" title="Refresh words" onClick={() => setOffset(offset + 1)}><FontAwesomeIcon icon={faRotate} /></button>
                </div>
                {view === 'Random' && <aside className="wm-mock-feature" aria-label="Featured favorite word">
                    <p className="wm-mock-feature-label">Featured favorite word</p>
                    <div><h2>{featured.word}<span>.</span></h2><p>{featured.def}</p></div>
                </aside>}
                {view === 'Albums' ? <div className="wm-mock-albums">
                    {['Cabinet of Curiosities', 'Haunted Castle', 'Words for an Autumn Day'].map(title => <button type="button" key={title} onClick={() => select('Favorites')}><FontAwesomeIcon icon={faFolderOpen} /><span>{title}</span><span aria-hidden="true">↗</span></button>)}
                </div> : <div className="wm-mock-words">
                    {words.map(word => <article className="wm-mock-word" key={word.id}>
                        <button type="button" className="wm-mock-word-menu" aria-label={`Options for ${word.word}`} onClick={() => setNotice(word.word)}><FontAwesomeIcon icon={faEllipsisVertical} /></button>
                        <p><strong>{word.word}<span>.</span></strong> {word.def}</p>
                        <button type="button" className="wm-mock-ask" onClick={() => setNotice(word.word)}><span aria-hidden="true">✦</span> Ask AI</button>
                    </article>)}
                </div>}
                <p className="wm-mock-note">Sample collection · <a href="/random">Return to WordMage ↗</a></p>
            </main>}

        <div className="wm-mock-preview-switch" role="group" aria-label="Preview page style">
            <span>Preview</span>
            {['Random', 'Rare Words', 'Gothic Words'].map(label => <button type="button" key={label} aria-pressed={view === label} onClick={() => select(label)}>{label}</button>)}
        </div>
        {menu && <>
            <button type="button" className="wm-mock-shade" aria-label="Close navigation" onClick={() => setMenu(false)} />
            <nav className="wm-mock-drawer" aria-label="Preview navigation">
                <div><span>Explore WordMage</span><button type="button" aria-label="Close navigation menu" onClick={() => setMenu(false)}>×</button></div>
                {['Random', 'Rare Words', 'Gothic Words', 'Browse', 'Favorites', 'Albums'].map((label, i) => <button type="button" key={label} aria-current={view === label ? 'page' : undefined} onClick={() => select(label)}><span aria-hidden="true">{['↝', 'Aa', '☾', 'A–Z', '♥', '▱'][i]}</span>{label}</button>)}
                <a href="/settings"><span aria-hidden="true">⚙</span>Settings</a><a href="/about"><span aria-hidden="true">?</span>About</a>
            </nav>
        </>}
        {notice && <div className="wm-mock-dialog-shade" onClick={() => setNotice('')}>
            <section className="wm-mock-dialog" role="dialog" aria-modal="true" aria-label={notice} onClick={event => event.stopPropagation()}>
                <button type="button" className="wm-mock-dialog-close" aria-label="Close dialog" onClick={() => setNotice('')}>×</button>
                <h2>{notice}</h2>
                {notice === 'Account' ? <p><a href={user ? '/settings' : '/login'}>{user ? 'Account settings' : 'Sign in to WordMage'} ↗</a></p> : notice === 'Share WordMage' ? <p><a href="https://wordmage.app">wordmage.app ↗</a></p> : <p>{vocabulary.find(word => word.word === notice)?.def}</p>}
                <small>Design preview — your collection is unchanged.</small>
            </section>
        </div>}
    </div>;
}
