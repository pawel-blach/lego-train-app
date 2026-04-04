# Frontend

Vite + React 18 + TypeScript app with a Windows 95 retro UI theme.

## UI Libraries

**IMPORTANT: Two separate libraries from two different GitHub orgs are in use. Do not confuse them.**

### `react95` (v4) — UI Components

- **GitHub**: react95-io/React95
- **Storybook**: https://storybook.react95.io
- **What**: Windows 95-style UI component library built on `styled-components`
- **Setup**: Requires `styled-components` (already a dependency). Wrap app with ThemeProvider + styleReset.
- **Import**: `import { Button, Window, ... } from 'react95'`
- **Themes**: Available from `react95/dist/themes/` (e.g. `original`). Fonts from `react95/dist/fonts/`
- **Key components**: Window, Button, TextInput, MenuList, MenuListItem, Separator, Toolbar, TreeView, Tabs, ProgressBar, Checkbox, Radio, Select, and more — see Storybook for full list.

### `@react95/icons` (v2.4) — Icons

- **GitHub**: React95/React95 (different org!)
- **Icon gallery**: https://react95.github.io/React95/?path=/story/icon--all
- **What**: Windows 95-style icon set (hundreds of icons from shell32, mmsys, progman, etc.)
- **Setup**: Import the CSS: `import '@react95/icons/icons.css'`
- **Import**: Icons are individual components, e.g. `import { Computer3 } from '@react95/icons'`
- **Categories**: File/folder ops, system utilities, networking, media, hardware, UI elements, applications

### Styling Stack

- `styled-components` v6 — required by react95, use for component-level Win95 styling
- `tailwindcss` v4 — available for layout/utility needs outside of react95 components
