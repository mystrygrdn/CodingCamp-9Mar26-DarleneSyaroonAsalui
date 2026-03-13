// Browser Start Page Application
// Main application entry point

/**
 * Theme Manager - Handles light/dark mode toggle
 */
class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.storageKey = 'theme';
    }

    init() {
        // Load saved theme
        const savedTheme = localStorage.getItem(this.storageKey);
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            this.currentTheme = savedTheme;
        }

        // Apply theme
        this.applyTheme();

        // Setup toggle button
        const toggleBtn = document.querySelector('.theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleTheme());
            this.updateToggleButton(toggleBtn);
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveTheme();
        
        const toggleBtn = document.querySelector('.theme-toggle');
        if (toggleBtn) {
            this.updateToggleButton(toggleBtn);
        }
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }

    updateToggleButton(button) {
        button.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        button.setAttribute('aria-label', 
            this.currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
        );
    }

    saveTheme() {
        localStorage.setItem(this.storageKey, this.currentTheme);
    }
}

/**
 * Settings Manager - Handles timer duration and other settings
 */
class SettingsManager {
    constructor() {
        this.settings = {
            timerDuration: 25 // minutes
        };
        this.storageKey = 'settings';
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const settingsToggle = document.querySelector('.settings-toggle');
        const settingsDropdown = document.querySelector('.settings-dropdown');
        const applyBtn = document.querySelector('.apply-timer-settings');
        const timerInput = document.querySelector('#timer-duration');

        if (settingsToggle && settingsDropdown) {
            settingsToggle.addEventListener('click', () => {
                settingsDropdown.classList.toggle('open');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!settingsToggle.contains(e.target) && !settingsDropdown.contains(e.target)) {
                    settingsDropdown.classList.remove('open');
                }
            });
        }

        if (applyBtn && timerInput) {
            applyBtn.addEventListener('click', () => {
                const newDuration = parseInt(timerInput.value);
                if (newDuration >= 1 && newDuration <= 120) {
                    this.settings.timerDuration = newDuration;
                    this.saveSettings();
                    
                    // Update timer if it exists
                    const event = new CustomEvent('timerDurationChanged', {
                        detail: { duration: newDuration }
                    });
                    document.dispatchEvent(event);
                    
                    settingsDropdown.classList.remove('open');
                }
            });
        }

        if (timerInput) {
            timerInput.value = this.settings.timerDuration;
        }
    }

    loadSettings() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.settings = { ...this.settings, ...parsed };
            } catch (e) {
                console.warn('Failed to load settings:', e);
            }
        }
    }

    saveSettings() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
    }

    getTimerDuration() {
        return this.settings.timerDuration;
    }
}

/**
 * App Controller - Manages application initialization and component lifecycle
 */
class AppController {
    constructor() {
        this.storageManager = null;
        this.themeManager = null;
        this.settingsManager = null;
        this.greetingDisplay = null;
        this.focusTimer = null;
        this.taskList = null;
        this.quickLinks = null;
    }

    /**
     * Initialize the application
     */
    init() {
        // Initialize theme manager first
        this.themeManager = new ThemeManager();
        this.themeManager.init();

        // Initialize settings manager
        this.settingsManager = new SettingsManager();
        this.settingsManager.init();

        // Check if Local Storage is available
        this.storageManager = new LocalStorageManager('startpage');
        
        if (!this.storageManager.isAvailable()) {
            console.warn('Local Storage is not available. Data will not persist.');
            this.displayStorageWarning();
        }

        // Initialize all components
        this.initializeComponents();
    }

    /**
     * Display a non-intrusive warning when Local Storage is unavailable
     */
    displayStorageWarning() {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'storage-warning';
        warningDiv.textContent = 'Local Storage is unavailable. Your data will not be saved between sessions.';
        warningDiv.setAttribute('role', 'alert');
        warningDiv.setAttribute('aria-live', 'polite');
        
        // Insert at the beginning of the main container
        const container = document.querySelector('.container');
        if (container && container.firstChild) {
            container.insertBefore(warningDiv, container.firstChild);
        } else if (container) {
            container.appendChild(warningDiv);
        } else {
            // Fallback: insert at beginning of body
            document.body.insertBefore(warningDiv, document.body.firstChild);
        }
    }

    /**
     * Initialize all application components
     */
    initializeComponents() {
        // Initialize Greeting Display
        const greetingElement = document.getElementById('greeting');
        if (greetingElement) {
            this.greetingDisplay = new GreetingDisplay(greetingElement);
            this.greetingDisplay.init();
        } else {
            console.warn('Greeting Display: DOM element #greeting not found. Skipping initialization.');
        }

        // Initialize Focus Timer
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            this.focusTimer = new FocusTimer(timerElement, this.settingsManager);
            this.focusTimer.init();
        } else {
            console.warn('Focus Timer: DOM element #timer not found. Skipping initialization.');
        }

        // Initialize Task List
        const tasksElement = document.getElementById('tasks');
        if (tasksElement) {
            this.taskList = new TaskList(tasksElement, this.storageManager);
            this.taskList.init();
        } else {
            console.warn('Task List: DOM element #tasks not found. Skipping initialization.');
        }

        // Initialize Quick Links
        const linksElement = document.getElementById('links');
        if (linksElement) {
            this.quickLinks = new QuickLinks(linksElement, this.storageManager);
            this.quickLinks.init();
        } else {
            console.warn('Quick Links: DOM element #links not found. Skipping initialization.');
        }
    }
}

/**
 * Local Storage Manager - Handles all Local Storage operations
 */
class LocalStorageManager {
    constructor(namespace) {
        this.namespace = namespace;
    }

    /**
     * Check if Local Storage is available
     */
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Save data to Local Storage with quota exceeded error handling
     */
    save(key, data) {
        try {
            const namespacedKey = `${this.namespace}_${key}`;
            localStorage.setItem(namespacedKey, JSON.stringify(data));
        } catch (e) {
            // Handle quota exceeded error specifically
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                console.error('Storage quota exceeded. Please delete some items.');
                throw new Error('QUOTA_EXCEEDED');
            }
            console.error('Failed to save to Local Storage:', e);
            throw e;
        }
    }

    /**
     * Load data from Local Storage with corrupted data handling
     */
    load(key) {
        try {
            const namespacedKey = `${this.namespace}_${key}`;
            const data = localStorage.getItem(namespacedKey);

            // Return null for missing data
            if (data === null) {
                return null;
            }

            // Attempt to parse JSON
            const parsed = JSON.parse(data);
            return parsed;
        } catch (e) {
            // Handle corrupted data (invalid JSON)
            if (e instanceof SyntaxError) {
                console.error('Corrupted data in Local Storage for key:', key);
                // Return null to allow initialization with empty state
                return null;
            }
            console.error('Failed to load from Local Storage:', e);
            return null;
        }
    }

    /**
     * Remove data from Local Storage
     */
    remove(key) {
        try {
            const namespacedKey = `${this.namespace}_${key}`;
            localStorage.removeItem(namespacedKey);
        } catch (e) {
            console.error('Failed to remove from Local Storage:', e);
        }
    }

    /**
     * Clear all data for this namespace
     */
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(`${this.namespace}_`)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (e) {
            console.error('Failed to clear Local Storage:', e);
        }
    }
}


/**
 * Greeting Display Component - Shows time, date, and greeting
 */
class GreetingDisplay {
    constructor(containerElement) {
        this.container = containerElement;
        this.intervalId = null;
        this.use24Hour = false;
    }

    init() {
        this.updateTime();
        this.intervalId = setInterval(() => this.updateTime(), 1000);
    }

    updateTime() {
        const now = new Date();
        const timeElement = this.container.querySelector('.time-display');
        const dateElement = this.container.querySelector('.date-display');
        const greetingElement = this.container.querySelector('.greeting-message');

        if (timeElement) {
            timeElement.textContent = this.formatTime(now);
        }

        if (dateElement) {
            dateElement.textContent = this.formatDate(now);
        }

        if (greetingElement) {
            greetingElement.textContent = this.getGreeting(now.getHours());
        }
    }

    formatTime(date) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        if (this.use24Hour) {
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else {
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            return `${displayHours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${period}`;
        }
    }

    formatDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    getGreeting(hour) {
        if (hour >= 5 && hour < 12) {
            return 'Good morning';
        } else if (hour >= 12 && hour < 17) {
            return 'Good afternoon';
        } else if (hour >= 17 && hour < 21) {
            return 'Good evening';
        } else {
            return 'Good night';
        }
    }

    destroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}

/**
 * Focus Timer Component - 25-minute Pomodoro timer with customizable duration
 */
class FocusTimer {
    constructor(containerElement, settingsManager) {
        this.container = containerElement;
        this.settingsManager = settingsManager;
        this.duration = (settingsManager?.getTimerDuration() || 25) * 60; // Convert minutes to seconds
        this.timeRemaining = this.duration;
        this.isRunning = false;
        this.intervalId = null;
    }

    init() {
        const startBtn = this.container.querySelector('.btn-start');
        const stopBtn = this.container.querySelector('.btn-stop');
        const resetBtn = this.container.querySelector('.btn-reset');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.start());
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stop());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }

        // Listen for timer duration changes
        document.addEventListener('timerDurationChanged', (e) => {
            this.updateDuration(e.detail.duration);
        });

        this.updateDisplay();
    }

    updateDuration(minutes) {
        const wasRunning = this.isRunning;
        this.stop();
        this.duration = minutes * 60;
        this.timeRemaining = this.duration;
        this.updateDisplay();
        
        if (wasRunning) {
            this.start();
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.intervalId = setInterval(() => this.tick(), 1000);
        }
    }

    stop() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    reset() {
        this.stop();
        this.timeRemaining = this.duration;
        this.updateDisplay();
    }

    tick() {
        if (this.timeRemaining > 0) {
            this.timeRemaining--;
            this.updateDisplay();
        } else {
            this.stop();
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    updateDisplay() {
        const displayElement = this.container.querySelector('.timer-display');
        if (displayElement) {
            displayElement.textContent = this.formatTime(this.timeRemaining);
        }
    }

    destroy() {
        this.stop();
    }
}

/**
 * Task List Component - Manages to-do items with sorting
 */
class TaskList {
    constructor(containerElement, storageManager) {
        this.container = containerElement;
        this.storageManager = storageManager;
        this.tasks = [];
        this.sortOrder = 'date-desc'; // Default sort order
    }

    init() {
        this.loadFromStorage();
        this.loadSortPreference();
        this.setupEventListeners();
        this.renderTasks();
    }

    setupEventListeners() {
        const form = this.container.querySelector('.task-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = this.container.querySelector('.task-input');
                if (input && input.value.trim()) {
                    this.addTask(input.value.trim());
                    input.value = '';
                }
            });
        }

        // Setup sort dropdown
        const sortSelect = this.container.querySelector('.task-sort');
        if (sortSelect) {
            sortSelect.value = this.sortOrder;
            sortSelect.addEventListener('change', (e) => {
                this.sortOrder = e.target.value;
                this.saveSortPreference();
                this.renderTasks();
            });
        }
    }

    sortTasks(tasks) {
        const sorted = [...tasks];
        
        switch (this.sortOrder) {
            case 'date-asc':
                return sorted.sort((a, b) => a.createdAt - b.createdAt);
            case 'date-desc':
                return sorted.sort((a, b) => b.createdAt - a.createdAt);
            case 'alpha-asc':
                return sorted.sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase()));
            case 'alpha-desc':
                return sorted.sort((a, b) => b.text.toLowerCase().localeCompare(a.text.toLowerCase()));
            case 'status-incomplete':
                return sorted.sort((a, b) => {
                    if (a.completed === b.completed) {
                        return b.createdAt - a.createdAt; // Secondary sort by date
                    }
                    return a.completed - b.completed; // Incomplete first
                });
            case 'status-complete':
                return sorted.sort((a, b) => {
                    if (a.completed === b.completed) {
                        return b.createdAt - a.createdAt; // Secondary sort by date
                    }
                    return b.completed - a.completed; // Completed first
                });
            default:
                return sorted;
        }
    }

    loadSortPreference() {
        if (this.storageManager) {
            const saved = this.storageManager.load('taskSort');
            if (saved && typeof saved === 'string') {
                this.sortOrder = saved;
            }
        }
    }

    saveSortPreference() {
        if (this.storageManager) {
            this.storageManager.save('taskSort', this.sortOrder);
        }
    }

    addTask(text) {
        const task = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            createdAt: Date.now()
        };
        this.tasks.push(task);
        this.saveToStorage();
        this.renderTasks();
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveToStorage();
            this.renderTasks();
        }
    }

    editTask(id, newText) {
        const task = this.tasks.find(t => t.id === id);
        if (task && newText && newText.trim().length > 0 && newText.length <= 500) {
            task.text = newText.trim();
            this.saveToStorage();
            this.renderTasks();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveToStorage();
        this.renderTasks();
    }

    renderTasks() {
        const listElement = this.container.querySelector('.task-list');
        if (!listElement) return;

        // Sort tasks before rendering
        const sortedTasks = this.sortTasks(this.tasks);

        listElement.innerHTML = '';
        sortedTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => this.toggleTask(task.id));

            const span = document.createElement('span');
            span.className = 'task-text';
            span.textContent = task.text;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-delete-task';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteBtn);
            listElement.appendChild(li);
        });
    }

    saveToStorage() {
        if (this.storageManager) {
            this.storageManager.save('tasks', this.tasks);
        }
    }

    validateTask(task) {
            return task &&
                typeof task.id === 'string' &&
                task.id.length > 0 &&
                typeof task.text === 'string' &&
                task.text.length > 0 &&
                task.text.length <= 500 &&
                typeof task.completed === 'boolean' &&
                typeof task.createdAt === 'number' &&
                task.createdAt > 0;
        }

        loadFromStorage() {
            if (this.storageManager) {
                const data = this.storageManager.load('tasks');
                if (Array.isArray(data)) {
                    // Validate each task before loading
                    this.tasks = data.filter(task => this.validateTask(task));
                }
            }
        }

}

/**
 * Quick Links Component - Manages favorite website shortcuts
 */
class QuickLinks {
    constructor(containerElement, storageManager) {
        this.container = containerElement;
        this.storageManager = storageManager;
        this.links = [];
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.renderLinks();
    }

    setupEventListeners() {
        const form = this.container.querySelector('.link-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const urlInput = this.container.querySelector('.link-url-input');
                const nameInput = this.container.querySelector('.link-name-input');
                
                if (urlInput && nameInput && urlInput.value && nameInput.value) {
                    const url = urlInput.value.trim();
                    const name = nameInput.value.trim();
                    
                    if (this.validateUrl(url)) {
                        this.addLink(url, name);
                        urlInput.value = '';
                        nameInput.value = '';
                    } else {
                        alert('Please enter a valid URL starting with http:// or https://');
                    }
                }
            });
        }
    }

    validateUrl(url) {
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch (e) {
            return false;
        }
    }

    validateLinkData(link) {
        if (!link || typeof link !== 'object') {
            return false;
        }
        
        // Validate id: required, non-empty string
        if (typeof link.id !== 'string' || link.id.trim() === '') {
            return false;
        }
        
        // Validate url: required, valid URL format
        if (typeof link.url !== 'string' || !this.validateUrl(link.url)) {
            return false;
        }
        
        // Validate displayName: required, non-empty string, max 50 characters
        if (typeof link.displayName !== 'string' || 
            link.displayName.trim() === '' || 
            link.displayName.length > 50) {
            return false;
        }
        
        // Validate createdAt: required, positive number
        if (typeof link.createdAt !== 'number' || link.createdAt < 0) {
            return false;
        }
        
        return true;
    }

    addLink(url, displayName) {
        const link = {
            id: Date.now().toString(),
            url: url,
            displayName: displayName,
            createdAt: Date.now()
        };
        this.links.push(link);
        this.saveToStorage();
        this.renderLinks();
    }

    deleteLink(id) {
        this.links = this.links.filter(l => l.id !== id);
        this.saveToStorage();
        this.renderLinks();
    }

    renderLinks() {
        const container = this.container.querySelector('.links-container');
        if (!container) return;

        container.innerHTML = '';
        this.links.forEach(link => {
            const linkDiv = document.createElement('div');
            linkDiv.className = 'link-item';
            linkDiv.style.position = 'relative';

            const anchor = document.createElement('a');
            anchor.href = link.url;
            anchor.className = 'link-name';
            anchor.textContent = link.displayName;
            // Open in new tab if Ctrl/Cmd+click, otherwise current tab
            anchor.addEventListener('click', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    // Let default behavior open in new tab
                    anchor.target = '_blank';
                    anchor.rel = 'noopener noreferrer';
                } else {
                    // Open in current tab
                    anchor.target = '_self';
                }
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-delete-link';
            deleteBtn.textContent = '×';
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.deleteLink(link.id);
            });

            linkDiv.appendChild(anchor);
            linkDiv.appendChild(deleteBtn);
            container.appendChild(linkDiv);
        });
    }

    saveToStorage() {
        if (this.storageManager) {
            this.storageManager.save('links', this.links);
        }
    }

    loadFromStorage() {
        if (this.storageManager) {
            const data = this.storageManager.load('links');
            if (Array.isArray(data)) {
                // Filter out invalid links using validation
                this.links = data.filter(link => this.validateLinkData(link));
            }
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new AppController();
    app.init();
});
