// ===== STUDY TOOLS APPLICATION =====
class StudyToolsApp {
    constructor() {
        this.initializeApp();
    }

    // ===== INITIALIZATION =====
    initializeApp() {
        this.initializeTheme();
        this.initializeTimer();
        this.initializeGoals();
        this.initializeFocusMode();
        this.initializeQuickSessions();
        this.initializeBreaks();
        this.initializeScrollAnimations();
        this.initializeKeyboardShortcuts();
        this.setupEventListeners();
    }

    // ===== THEME MANAGEMENT =====
    initializeTheme() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.currentTheme = localStorage.getItem('theme') || 'light';

        if (this.currentTheme === 'dark') {
            document.body.classList.add('dark-mode');
            this.themeToggle.checked = true;
        }

        this.themeToggle.addEventListener('change', () => this.toggleTheme());
    }

    toggleTheme() {
        if (this.themeToggle.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    }

    // ===== POMODORO TIMER =====
    initializeTimer() {
        this.timerInterval = null;
        this.timeLeft = 25 * 60;
        this.isRunning = false;
        this.isBreak = false;
        this.sessionCount = 0;
        this.totalStudyTime = 0;

        this.timerDisplay = document.getElementById('timer-display');
        this.startBtn = document.getElementById('start-timer');
        this.pauseBtn = document.getElementById('pause-timer');
        this.resetBtn = document.getElementById('reset-timer');
        this.sessionType = document.getElementById('session-type');
        this.sessionDots = document.querySelectorAll('.session-dot');
        this.timerContainer = document.querySelector('.timer-container');

        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    startTimer() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            
            this.timerContainer.classList.add('timer-active');
            this.startBtn.classList.add('loading');
            
            this.timerInterval = setInterval(() => {
                this.timeLeft--;
                this.updateTimerDisplay();
                
                if (!this.isBreak) {
                    this.totalStudyTime++;
                    this.updateAnalytics();
                }
                
                if (this.timeLeft === 0) {
                    this.handleTimerCompletion();
                }
            }, 1000);
        }
    }

    handleTimerCompletion() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        
        this.timerContainer.classList.remove('timer-active');
        this.timerContainer.classList.add('success-animation');
        setTimeout(() => {
            this.timerContainer.classList.remove('success-animation');
        }, 600);
        
        this.playNotificationSound();
        
        if (!this.isBreak) {
            this.handleStudySessionComplete();
        } else {
            this.handleBreakComplete();
        }
        
        this.updateTimerDisplay();
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.startBtn.classList.remove('loading');
    }

    handleStudySessionComplete() {
        this.sessionCount++;
        if (this.sessionCount <= this.sessionDots.length) {
            this.sessionDots[this.sessionCount - 1].classList.add('active');
            this.sessionDots[this.sessionCount - 1].style.animation = 'dot-pulse 2s infinite';
        }
        
        this.isBreak = true;
        this.timeLeft = 5 * 60;
        this.sessionType.textContent = 'Break';
        
        document.querySelector('.tool-card:nth-child(1)').classList.add('focus-active');
        setTimeout(() => {
            document.querySelector('.tool-card:nth-child(1)').classList.remove('focus-active');
        }, 2000);
        
        this.showNotification('Study session completed! Time for a 5-minute break.');
    }

    handleBreakComplete() {
        this.isBreak = false;
        this.timeLeft = 25 * 60;
        this.sessionType.textContent = 'Study';
        this.showNotification('Break over! Time to focus again.');
    }

    pauseTimer() {
        if (this.isRunning) {
            clearInterval(this.timerInterval);
            this.isRunning = false;
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            this.timerContainer.classList.remove('timer-active');
            this.startBtn.classList.remove('loading');
        }
    }

    resetTimer() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.isBreak = false;
        this.timeLeft = 25 * 60;
        this.sessionType.textContent = 'Study';
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.timerContainer.classList.remove('timer-active');
        this.startBtn.classList.remove('loading');
        this.updateTimerDisplay();
        
        this.sessionDots.forEach(dot => {
            dot.classList.remove('active');
            dot.style.animation = 'none';
        });
        this.sessionCount = 0;
    }

    // ===== GOAL MANAGEMENT =====
    initializeGoals() {
        this.goalTitle = document.getElementById('goal-title');
        this.goalSubject = document.getElementById('goal-subject');
        this.addGoalBtn = document.getElementById('add-goal');
        this.goalsList = document.getElementById('goals-list');
        this.goals = JSON.parse(localStorage.getItem('studyGoals')) || [];
        
        this.renderGoals();
    }

    addGoal() {
        const title = this.goalTitle.value.trim();
        const subject = this.goalSubject.value;
        
        if (title && subject) {
            const goal = {
                id: Date.now(),
                title,
                subject,
                completed: false,
                createdAt: new Date(),
                completedAt: null
            };
            
            this.goals.push(goal);
            this.saveGoals();
            this.renderGoals();
            
            this.addGoalBtn.classList.add('success-animation');
            setTimeout(() => {
                this.addGoalBtn.classList.remove('success-animation');
            }, 600);
            
            this.goalTitle.value = '';
            this.goalSubject.value = '';
            
            const emptyState = this.goalsList.querySelector('.empty-state');
            if (emptyState) {
                emptyState.remove();
            }
            
            this.showNotification('Goal added successfully!');
        } else {
            this.showNotification('Please fill in both goal title and subject.', 'error');
        }
    }

    renderGoals() {
        this.goalsList.innerHTML = '';
        
        if (this.goals.length === 0) {
            this.goalsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No goals set yet. Add your first goal above!</p>
                </div>
            `;
            return;
        }
        
        this.goals.forEach(goal => {
            const goalItem = document.createElement('div');
            goalItem.className = `goal-item ${goal.completed ? 'completed' : ''}`;
            goalItem.innerHTML = `
                <div class="goal-info">
                    <h4>${goal.title}</h4>
                    <p>Subject: ${goal.subject.charAt(0).toUpperCase() + goal.subject.slice(1)}</p>
                    <small>Created: ${new Date(goal.createdAt).toLocaleDateString()}</small>
                    ${goal.completed ? `<small class="completed-text">Completed: ${new Date(goal.completedAt).toLocaleDateString()}</small>` : ''}
                </div>
                <div class="goal-actions">
                    <button class="goal-btn btn-complete" onclick="studyTools.completeGoal(${goal.id})" title="Mark as completed" ${goal.completed ? 'disabled' : ''}>
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="goal-btn btn-delete" onclick="studyTools.deleteGoal(${goal.id})" title="Delete goal">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            this.goalsList.appendChild(goalItem);
        });
    }

    completeGoal(id) {
        const goal = this.goals.find(g => g.id === id);
        if (goal && !goal.completed) {
            goal.completed = true;
            goal.completedAt = new Date();
            this.saveGoals();
            this.renderGoals();
            this.showNotification('Goal marked as completed! 🎉');
            this.updateAnalytics();
        }
    }

    deleteGoal(id) {
        if (confirm('Are you sure you want to delete this goal?')) {
            this.goals = this.goals.filter(goal => goal.id !== id);
            this.saveGoals();
            this.renderGoals();
            this.showNotification('Goal deleted.');
            this.updateAnalytics();
        }
    }

    saveGoals() {
        localStorage.setItem('studyGoals', JSON.stringify(this.goals));
    }

    // ===== FOCUS MODE =====
    initializeFocusMode() {
        this.enableFocusBtn = document.getElementById('enable-focus');
        this.blockDistractionsBtn = document.getElementById('block-distractions');
        this.focusTimeElement = document.getElementById('focus-time');
        this.focusStreakElement = document.getElementById('focus-streak');

        this.focusModeActive = false;
        this.totalFocusTime = parseInt(localStorage.getItem('totalFocusTime')) || 0;
        this.focusStreak = parseInt(localStorage.getItem('focusStreak')) || 0;
        this.focusInterval = null;

        this.updateFocusDisplay();
    }

    toggleFocusMode() {
        this.focusModeActive = !this.focusModeActive;
        
        if (this.focusModeActive) {
            document.body.classList.add('focus-active');
            this.enableFocusBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Disable Focus Mode';
            this.enableFocusBtn.style.background = 'var(--success)';
            this.showNotification('Focus mode enabled! Minimizing distractions...');
            this.startFocusTracking();
        } else {
            document.body.classList.remove('focus-active');
            this.enableFocusBtn.innerHTML = '<i class="fas fa-eye"></i> Enable Focus Mode';
            this.enableFocusBtn.style.background = 'var(--primary)';
            this.showNotification('Focus mode disabled.');
            this.stopFocusTracking();
        }
    }

    startFocusTracking() {
        this.focusInterval = setInterval(() => {
            this.totalFocusTime++;
            localStorage.setItem('totalFocusTime', this.totalFocusTime.toString());
            this.updateFocusDisplay();
        }, 1000);
    }

    stopFocusTracking() {
        if (this.focusInterval) {
            clearInterval(this.focusInterval);
            this.focusInterval = null;
        }
    }

    updateFocusDisplay() {
        const hours = Math.floor(this.totalFocusTime / 3600);
        const minutes = Math.floor((this.totalFocusTime % 3600) / 60);
        this.focusTimeElement.textContent = `${hours}h ${minutes}m`;
        
        if (this.totalFocusTime >= 3600) {
            this.focusStreak = Math.max(this.focusStreak, 1);
            localStorage.setItem('focusStreak', this.focusStreak.toString());
            this.focusStreakElement.textContent = this.focusStreak;
        }
    }

    // ===== QUICK SESSIONS =====
    initializeQuickSessions() {
        this.quickSessionBtns = document.querySelectorAll('.session-btn[data-minutes]');
    }

    startQuickSession(minutes) {
        this.timeLeft = minutes * 60;
        this.isBreak = false;
        this.sessionType.textContent = 'Study';
        this.updateTimerDisplay();
        this.resetTimer();
        this.startTimer();
        
        this.showNotification(`Started ${minutes}-minute focus session!`);
    }

    // ===== BREAK MANAGEMENT =====
    initializeBreaks() {
        this.breakBtns = document.querySelectorAll('.break-btn');
        this.nextBreakElement = document.getElementById('next-break');
        this.updateNextBreakTimer();
    }

    startBreakActivity(breakType) {
        this.showNotification(`Starting ${breakType} break activity!`);
        
        // If timer is running, pause it for the break
        if (this.isRunning && !this.isBreak) {
            this.pauseTimer();
        }
    }

    updateNextBreakTimer() {
        // Update next break time based on current session
        const nextBreak = this.isBreak ? 'Now' : `${Math.floor(this.timeLeft / 60)} minutes`;
        this.nextBreakElement.textContent = nextBreak;
    }

    // ===== ANALYTICS =====
    updateAnalytics() {
        const completedGoals = this.goals.filter(goal => goal.completed).length;
        const totalGoals = this.goals.length;
        
        // Update goals completed
        const goalsElement = document.querySelector('.analytics-card:nth-child(4) .analytics-value');
        if (goalsElement) {
            goalsElement.textContent = `${completedGoals}/${totalGoals}`;
        }
        
        // Update productivity
        const productivityElement = document.querySelector('.analytics-card:nth-child(2) .analytics-value');
        if (productivityElement && totalGoals > 0) {
            const productivity = Math.round((completedGoals / totalGoals) * 100);
            productivityElement.textContent = `${productivity}%`;
        }
        
        // Update study time
        const studyTimeElement = document.querySelector('.analytics-card:nth-child(1) .analytics-value');
        if (studyTimeElement) {
            const hours = (this.totalStudyTime / 3600).toFixed(1);
            studyTimeElement.textContent = `${hours}h`;
        }
        
        // Update streak
        const streakElement = document.querySelector('.analytics-card:nth-child(3) .analytics-value');
        if (streakElement) {
            streakElement.textContent = this.focusStreak;
        }
    }

    // ===== NOTIFICATION SYSTEM =====
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success)' : 'var(--danger)'};
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            max-width: 350px;
            border-left: 4px solid ${type === 'success' ? 'var(--success)' : 'var(--danger)'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }, 4000);
    }

    playNotificationSound() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Audio context not supported:', error);
        }
    }

    // ===== ANIMATIONS =====
    initializeScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);

        const toolsGrid = document.querySelector('.tools-grid');
        if (toolsGrid) {
            observer.observe(toolsGrid);
        }

        document.querySelectorAll('.tool-card').forEach((card, index) => {
            card.style.transitionDelay = `${(index + 1) * 0.1}s`;
            observer.observe(card);
        });

        // Add decorative shapes
        const studyToolsSection = document.querySelector('.study-tools-section');
        if (studyToolsSection) {
            const shapesContainer = document.createElement('div');
            shapesContainer.className = 'morphing-shapes';
            shapesContainer.innerHTML = `
                <div class="shape"></div>
                <div class="shape"></div>
                <div class="shape"></div>
            `;
            studyToolsSection.style.position = 'relative';
            studyToolsSection.appendChild(shapesContainer);
        }
    }

    // ===== KEYBOARD SHORTCUTS =====
    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.target.matches('input, textarea, select')) {
                e.preventDefault();
                if (this.isRunning) {
                    this.pauseTimer();
                } else {
                    this.startTimer();
                }
            }
            
            if (e.code === 'Escape' && !e.target.matches('input, textarea, select')) {
                this.resetTimer();
            }
            
            // Ctrl/Cmd + D to toggle focus mode
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.toggleFocusMode();
            }
        });
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Timer controls
        this.startBtn.addEventListener('click', () => this.startTimer());
        this.pauseBtn.addEventListener('click', () => this.pauseTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());

        // Goal management
        this.addGoalBtn.addEventListener('click', () => this.addGoal());
        this.goalTitle.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addGoal();
        });

        // Quick sessions
        this.quickSessionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const minutes = parseInt(btn.getAttribute('data-minutes'));
                this.startQuickSession(minutes);
                btn.classList.add('success-animation');
                setTimeout(() => btn.classList.remove('success-animation'), 600);
            });
        });

        // Focus mode
        this.enableFocusBtn.addEventListener('click', () => this.toggleFocusMode());
        this.blockDistractionsBtn.addEventListener('click', () => {
            this.blockDistractionsBtn.classList.add('loading');
            setTimeout(() => {
                this.blockDistractionsBtn.classList.remove('loading');
                this.showNotification('Distractions blocked! Social media and notifications muted.');
            }, 1500);
        });

        // Break activities
        this.breakBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const breakType = btn.textContent.trim().toLowerCase();
                this.startBreakActivity(breakType);
                btn.classList.add('success-animation');
                setTimeout(() => btn.classList.remove('success-animation'), 600);
            });
        });
    }
}
const relaxBtn = document.getElementById("relaxing-music");
const lofiPlayer = document.getElementById("lofi-player");
let isPlaying = false;

relaxBtn.addEventListener("click", () => {
    if (!isPlaying) {
        lofiPlayer.src = "https://www.youtube.com/embed/n61ULEU7CO0?start=0&autoplay=1&loop=1&playlist=n61ULEU7CO0";
        relaxBtn.innerHTML = '<i class="fas fa-pause"></i> Stop Music';
        isPlaying = true;
    } else {
        lofiPlayer.src = ""; // stops the video
        relaxBtn.innerHTML = '<i class="fas fa-music"></i> Relaxing Music';
        isPlaying = false;
    }
});

// ===== INITIALIZE APPLICATION =====
let studyTools;

document.addEventListener('DOMContentLoaded', function() {
    studyTools = new StudyToolsApp();
    
    // Make methods globally available for HTML onclick attributes
    window.studyTools = studyTools;
});