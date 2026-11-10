import { ALBUM_THEMES, migrateRemovedTheme } from './themes';
afterEach(() => localStorage.clear());

test.each(['arcane', 'eldritch', 'obsidian'])('saved %s theme migrates to the default', theme => {
    localStorage.setItem('wordmage.albumTheme', theme);
    migrateRemovedTheme();
    expect(localStorage.getItem('wordmage.albumTheme')).toBe('classic');
    expect(ALBUM_THEMES).not.toContain(theme);
});
test.each(['classic', 'paper', 'ink', 'fogbound'])('preserves saved %s theme', theme => {
    localStorage.setItem('wordmage.albumTheme', theme);
    migrateRemovedTheme();
    expect(localStorage.getItem('wordmage.albumTheme')).toBe(theme);
});
