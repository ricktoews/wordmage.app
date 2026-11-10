export const ALBUM_THEMES = ['classic', 'paper', 'ink', 'fogbound'];
// Retained only to migrate saved preferences and clear obsolete body classes.
export const REMOVED_THEMES = ['arcane', 'eldritch', 'obsidian'];

export function migrateRemovedTheme() {
    try {
        const saved = window.localStorage.getItem('wordmage.albumTheme');
        if (REMOVED_THEMES.includes(saved)) {
            window.localStorage.setItem('wordmage.albumTheme', 'classic');
        }
    } catch (_) { /* Storage can be unavailable; page-level defaults still apply. */ }
}
