# Browser Start Page

A clean, modern browser start page with productivity features built using vanilla HTML, CSS, and JavaScript.

## Features

### 🕒 Time & Greeting Display
- Real-time clock with 12-hour format
- Current date display
- Dynamic greeting based on time of day (Good morning/afternoon/evening/night)

### ⏱️ Focus Timer (Pomodoro)
- Customizable timer duration (1-120 minutes, default 25 minutes)
- Start, stop, and reset functionality
- Settings panel for timer customization
- Timer preferences saved in localStorage

### ✅ Task Management
- Add, edit, and delete tasks
- Mark tasks as complete/incomplete
- Task sorting options:
  - Newest First / Oldest First
  - Alphabetical (A-Z / Z-A)
  - Incomplete First / Completed First
- Tasks persist in localStorage
- Sort preferences saved

### 🔗 Quick Links
- Add favorite website shortcuts
- URL validation (requires http:// or https://)
- Click to open links (Ctrl/Cmd+click for new tab)
- Delete unwanted links
- Links persist in localStorage

### 🌙 Theme Toggle
- Light and dark mode support
- Smooth theme transitions
- Theme preference saved in localStorage
- Accessible theme toggle button

## How to Use

1. **Open the application**: Simply open `index.html` in any modern web browser
2. **No installation required**: Pure vanilla JavaScript - no dependencies needed
3. **All data is saved locally**: Your tasks, links, and preferences are stored in your browser's localStorage

## Project Structure

```
browser-start-page/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Single CSS file with theme support
├── js/
│   └── app.js          # Single JavaScript file with all functionality
└── README.md           # This documentation file
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

## Features in Detail

### Theme System
- CSS custom properties for seamless theme switching
- Automatic theme persistence
- Smooth color transitions

### Timer Settings
- Adjustable duration from 1 to 120 minutes
- Settings dropdown with apply button
- Dynamic timer updates without losing progress

### Task Sorting
- Six different sorting options
- Real-time sorting updates
- Persistent sort preferences

### Data Persistence
- All user data stored in localStorage
- Graceful handling of storage unavailability
- Data validation and error recovery

## Technical Implementation

- **Pure Vanilla JavaScript**: No frameworks or libraries
- **Component-based Architecture**: Modular class structure
- **CSS Custom Properties**: For theme system
- **Local Storage API**: For data persistence
- **Responsive Design**: Works on desktop and mobile
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Performance

- Initial load time: <500ms
- Interaction response: <100ms
- Storage operations: <50ms
- No external dependencies
- Minimal resource usage

## License

MIT License - Feel free to use and modify as needed.