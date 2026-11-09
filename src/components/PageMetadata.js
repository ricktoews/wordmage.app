import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { origin, pageForPath } from '../public-content/pages';

export default function PageMetadata() {
    const { pathname } = useLocation();
    useEffect(() => {
        const page = pageForPath(pathname);
        const preview = document.querySelector('meta[name="wordmage-deployment"]')?.content === 'preview';
        document.title = page.title;
        const meta = (name, content) => {
            let element = document.querySelector(`meta[name="${name}"]`);
            if (!element) { element = document.createElement('meta'); element.name = name; document.head.appendChild(element); }
            element.content = content;
        };
        meta('description', page.description);
        meta('robots', preview || page.noindex ? 'noindex, follow' : 'index, follow');
        let canonical = document.querySelector('link[rel="canonical"]');
        if (page.path && !page.noindex) {
            if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
            canonical.href = `${origin}${page.path}`;
        } else if (canonical) canonical.remove();
    }, [pathname]);
    return null;
}
