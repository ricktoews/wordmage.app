// Keep real, crawlable hrefs while retaining client-side navigation after startup.
export function navigatePublicLink(event, history) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target.closest?.('a[data-public-link]');
    if (!anchor || anchor.target || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href);
    if (url.origin !== window.location.origin) return;
    event.preventDefault();
    history.push(url.pathname + url.search + url.hash);
    window.scrollTo(0, 0);
}
