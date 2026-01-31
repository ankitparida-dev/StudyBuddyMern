// Theme Toggle
        const themeToggle = document.getElementById('theme-toggle');
        const body = document.body;

        // Check for saved theme preference or default to light
        const savedTheme = localStorage.getItem('theme') || 'light';
        body.classList.add(savedTheme + '-theme');
        if (savedTheme === 'dark') {
            themeToggle.checked = true;
            body.classList.add('dark-mode');
        }

        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                body.classList.remove('light-theme');
                body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                body.classList.remove('dark-mode');
                body.classList.add('light-theme');
                localStorage.setItem('theme', 'light');
            }
        });

        // Progress Tracker Functionality
        class ProgressTracker {
            constructor(examType) {
                this.examType = examType;
                this.currentSubject = examType === 'jee' ? 'physics' : 'biology';
                this.questions = [];
                this.history = JSON.parse(localStorage.getItem(`${examType}PracticeHistory`)) || [];
                this.init();
            }

            init() {
                this.setupEventListeners();
                this.loadQuestions();
                this.updateStats();
                this.renderHistory();
            }

            setupEventListeners() {
                // Subject tabs
                const subjectTabs = document.querySelectorAll(`.${this.examType}-content .subject-tab`);
                if (subjectTabs.length > 0) {
                    subjectTabs.forEach(tab => {
                        tab.addEventListener('click', () => {
                            document.querySelectorAll(`.${this.examType}-content .subject-tab`).forEach(t => t.classList.remove('active'));
                            tab.classList.add('active');
                            this.currentSubject = tab.dataset.subject;
                            this.loadQuestions();
                        });
                    });
                }

                // Add question button
                const addQuestionBtn = document.getElementById(`${this.examType}-add-question`);
                if (addQuestionBtn) {
                    addQuestionBtn.addEventListener('click', () => {
                        this.addQuestion();
                    });
                }

                // Clear all button
                const clearAllBtn = document.getElementById(`${this.examType}-clear-all`);
                if (clearAllBtn) {
                    clearAllBtn.addEventListener('click', () => {
                        if (this.questions.length > 0 && confirm('Are you sure you want to clear all questions?')) {
                            this.questions = [];
                            this.renderQuestions();
                            this.updateStats();
                        }
                    });
                }

                // Save session button
                const saveSessionBtn = document.getElementById(`${this.examType}-save-session`);
                if (saveSessionBtn) {
                    saveSessionBtn.addEventListener('click', () => {
                        this.saveSession();
                    });
                }
            }

            addQuestion() {
                const topicInput = document.getElementById(`${this.examType}-topic-name`);
                const topic = topicInput ? topicInput.value.trim() || `Untitled Topic` : `Untitled Topic`;
                
                const newQuestion = {
                    id: Date.now(),
                    text: `Question ${this.questions.length + 1} from ${topic}`,
                    topic: topic,
                    subject: this.currentSubject,
                    checked: false,
                    timestamp: new Date().toISOString()
                };

                this.questions.push(newQuestion);
                this.renderQuestions();
                this.updateStats();
                
                // Clear topic input after first question
                if (topicInput && this.questions.length === 1) {
                    topicInput.value = '';
                }
            }

            toggleQuestion(id) {
                const question = this.questions.find(q => q.id === id);
                if (question) {
                    question.checked = !question.checked;
                    this.renderQuestions();
                    this.updateStats();
                }
            }

            deleteQuestion(id) {
                this.questions = this.questions.filter(q => q.id !== id);
                this.renderQuestions();
                this.updateStats();
            }

            renderQuestions() {
                const container = document.getElementById(`${this.examType}-questions-container`);
                const emptyState = document.getElementById(`${this.examType}-empty-state`);
                
                if (!container) return;

                if (this.questions.length === 0) {
                    if (emptyState) {
                        emptyState.style.display = 'block';
                    }
                    container.innerHTML = '';
                    if (emptyState) {
                        container.appendChild(emptyState);
                    }
                    return;
                }

                if (emptyState) {
                    emptyState.style.display = 'none';
                }
                
                container.innerHTML = this.questions.map(question => `
                    <div class="question-item ${question.checked ? 'checked' : ''}" data-id="${question.id}">
                        <div class="question-checkbox ${question.checked ? 'checked' : ''}" 
                             onclick="window.tracker['${this.examType}'].toggleQuestion(${question.id})">
                            ${question.checked ? '✓' : ''}
                        </div>
                        <div class="question-text">${question.text}</div>
                        <button class="btn-icon" onclick="window.tracker['${this.examType}'].deleteQuestion(${question.id})" 
                                aria-label="Delete question">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('');
            }

            updateStats() {
                const totalQuestions = this.questions.length;
                const correctQuestions = this.questions.filter(q => q.checked).length;
                const accuracy = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;
                
                // Update main stats
                const correctCountEl = document.getElementById(`${this.examType}-correct-count`);
                const accuracyRateEl = document.getElementById(`${this.examType}-accuracy-rate`);
                const dailyGoalEl = document.getElementById(`${this.examType}-daily-goal`);
                
                if (correctCountEl) correctCountEl.textContent = correctQuestions;
                if (accuracyRateEl) accuracyRateEl.textContent = `${accuracy}%`;
                if (dailyGoalEl) dailyGoalEl.textContent = `${correctQuestions}/10`;
                
                // Update session summary
                const totalQuestionsEl = document.getElementById(`${this.examType}-total-questions`);
                const correctQuestionsEl = document.getElementById(`${this.examType}-correct-questions`);
                const sessionAccuracyEl = document.getElementById(`${this.examType}-session-accuracy`);
                
                if (totalQuestionsEl) totalQuestionsEl.textContent = totalQuestions;
                if (correctQuestionsEl) correctQuestionsEl.textContent = correctQuestions;
                if (sessionAccuracyEl) sessionAccuracyEl.textContent = `${accuracy}%`;
            }

            saveSession() {
                if (this.questions.length === 0) {
                    this.showNotification('Please add at least one question before saving.', 'error');
                    return;
                }

                const session = {
                    id: Date.now(),
                    date: new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    }),
                    timestamp: new Date().toISOString(),
                    subject: this.currentSubject,
                    totalQuestions: this.questions.length,
                    correctQuestions: this.questions.filter(q => q.checked).length,
                    accuracy: Math.round((this.questions.filter(q => q.checked).length / this.questions.length) * 100),
                    questions: [...this.questions]
                };

                this.history.unshift(session);
                localStorage.setItem(`${this.examType}PracticeHistory`, JSON.stringify(this.history));
                
                // Reset current session
                this.questions = [];
                this.renderQuestions();
                this.updateStats();
                this.renderHistory();
                
                this.showNotification('Practice session saved successfully!');
            }

            renderHistory() {
                const historyList = document.getElementById(`${this.examType}-history-list`);
                
                if (!historyList) return;

                if (this.history.length === 0) {
                    historyList.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-history"></i>
                            <p>No practice sessions recorded yet.</p>
                        </div>
                    `;
                    return;
                }

                historyList.innerHTML = this.history.slice(0, 5).map(session => `
                    <div class="history-item">
                        <div class="history-date">${session.date}</div>
                        <div class="history-stats">
                            <div class="history-stat">
                                <div class="history-value">${session.totalQuestions}</div>
                                <div class="history-label">Total</div>
                            </div>
                            <div class="history-stat">
                                <div class="history-value">${session.correctQuestions}</div>
                                <div class="history-label">Correct</div>
                            </div>
                            <div class="history-stat">
                                <div class="history-value">${session.accuracy}%</div>
                                <div class="history-label">Accuracy</div>
                            </div>
                            <div class="history-stat">
                                <div class="history-value">${session.subject}</div>
                                <div class="history-label">Subject</div>
                            </div>
                        </div>
                    </div>
                `).join('');
            }

            loadQuestions() {
                // In a real app, this would load from localStorage or API
                // For now, we'll just use the current questions array
                this.renderQuestions();
            }

            showNotification(message, type = 'success') {
                const notification = document.createElement('div');
                notification.className = `notification ${type}`;
                notification.innerHTML = `
                    <div class="notification-content">
                        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                        <span>${message}</span>
                    </div>
                `;
                
                document.body.appendChild(notification);
                
                // Animate in
                setTimeout(() => {
                    notification.style.transform = 'translateX(0)';
                }, 100);
                
                // Remove after 3 seconds
                setTimeout(() => {
                    notification.style.transform = 'translateX(400px)';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 400);
                }, 3000);
            }
        }

        // Section Visibility and Animations
        function initSectionObserver() {
            const sections = document.querySelectorAll('.section');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });
            
            sections.forEach(section => {
                observer.observe(section);
            });
        }

        // Progress Bar Animations
        function animateProgressBars() {
            const progressBars = document.querySelectorAll('.progress-fill');
            
            progressBars.forEach(bar => {
                const targetWidth = bar.getAttribute('data-target') + '%';
                setTimeout(() => {
                    bar.style.width = targetWidth;
                }, 500);
            });
        }

        // Exam Type Toggle
        function initExamToggle() {
            const examTabs = document.querySelectorAll('.exam-tab');
            const jeeContent = document.querySelector('.jee-content');
            const neetContent = document.querySelector('.neet-content');
            
            if (examTabs.length === 0) return;

            examTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Update active tab
                    examTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    const examType = tab.dataset.exam;
                    
                    // Show/hide content
                    if (examType === 'jee') {
                        if (jeeContent) jeeContent.style.display = 'block';
                        if (neetContent) neetContent.style.display = 'none';
                        if (window.tracker && window.tracker.jee) {
                            window.tracker.jee.init();
                        }
                    } else {
                        if (jeeContent) jeeContent.style.display = 'none';
                        if (neetContent) neetContent.style.display = 'block';
                        if (window.tracker && window.tracker.neet) {
                            window.tracker.neet.init();
                        }
                    }
                });
            });
        }

        // AI Chat Functionality
        function initChatAssistant() {
            const chatToggle = document.getElementById('chatToggle');
            const chatWindow = document.getElementById('chatWindow');
            const closeChat = document.getElementById('closeChat');
            const sendMessage = document.getElementById('sendMessage');
            const chatInput = document.getElementById('chatInput');
            const chatMessages = document.getElementById('chatMessages');
            const quickBtns = document.querySelectorAll('.quick-btn');

            if (!chatToggle || !chatWindow) return;

            // Toggle chat window
            chatToggle.addEventListener('click', () => {
                const isActive = chatWindow.classList.contains('active');
                chatWindow.classList.toggle('active', !isActive);
                chatWindow.setAttribute('aria-hidden', isActive);
                
                if (!isActive && chatInput) {
                    chatInput.focus();
                }
            });

            // Close chat
            if (closeChat) {
                closeChat.addEventListener('click', () => {
                    chatWindow.classList.remove('active');
                    chatWindow.setAttribute('aria-hidden', 'true');
                });
            }

            // Send message
            function sendUserMessage() {
                if (!chatInput || !chatMessages) return;
                
                const message = chatInput.value.trim();
                if (message) {
                    addMessage(message, 'user');
                    chatInput.value = '';
                    
                    // Simulate AI response
                    setTimeout(() => {
                        const aiResponse = generateAIResponse(message);
                        addMessage(aiResponse, 'ai');
                    }, 1000);
                }
            }

            if (sendMessage) {
                sendMessage.addEventListener('click', sendUserMessage);
            }

            if (chatInput) {
                chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        sendUserMessage();
                    }
                });
            }

            // Quick action buttons
            if (quickBtns.length > 0) {
                quickBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const question = btn.dataset.question;
                        if (chatInput) {
                            chatInput.value = question;
                            sendUserMessage();
                        }
                    });
                });
            }

            function addMessage(content, sender) {
                if (!chatMessages) return;
                
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${sender}-message`;
                
                const avatar = sender === 'user' ? 
                    '<i class="fas fa-user"></i>' : 
                    '<i class="fas fa-robot"></i>';
                
                const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                messageDiv.innerHTML = `
                    <div class="message-avatar" aria-hidden="true">
                        ${avatar}
                    </div>
                    <div class="message-content">
                        <p>${content}</p>
                        <span class="message-time">${time}</span>
                    </div>
                `;
                
                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }

            function generateAIResponse(userMessage) {
                const responses = {
                    'kinematics': "Kinematics deals with the motion of objects without considering the forces that cause the motion. Key concepts include displacement, velocity, acceleration, and the equations of motion. Important formulas include v = u + at, s = ut + ½at², and v² = u² + 2as.",
                    'organic chemistry': "Important topics in Organic Chemistry include: 1) IUPAC nomenclature, 2) Isomerism, 3) Reaction mechanisms, 4) Named reactions, 5) Biomolecules. Focus on understanding reaction mechanisms rather than memorization.",
                    'physics': "For Physics, I'd recommend this study sequence: 1) Mechanics, 2) Thermodynamics, 3) Electromagnetism, 4) Optics, 5) Modern Physics. Start with basics and gradually move to complex topics."
                };

                const lowerMessage = userMessage.toLowerCase();
                
                for (const [key, response] of Object.entries(responses)) {
                    if (lowerMessage.includes(key)) {
                        return response;
                    }
                }

                return "I'd be happy to help you with that! For detailed explanations of syllabus topics, specific study strategies, or concept clarifications, please ask me about any particular topic you're struggling with. I can provide explanations, important points, and study tips.";
            }
        }

        // Study Path Navigation
        function initStudyPath() {
            const pathContainer = document.getElementById('pathContainer');
            const pathPrev = document.getElementById('pathPrev');
            const pathNext = document.getElementById('pathNext');

            if (pathPrev && pathNext && pathContainer) {
                pathNext.addEventListener('click', () => {
                    pathContainer.scrollBy({ left: 200, behavior: 'smooth' });
                });

                pathPrev.addEventListener('click', () => {
                    pathContainer.scrollBy({ left: -200, behavior: 'smooth' });
                });
            }

            // NEET path navigation
            const neetPathContainer = document.getElementById('neet-pathContainer');
            const neetPathPrev = document.getElementById('neet-pathPrev');
            const neetPathNext = document.getElementById('neet-pathNext');

            if (neetPathPrev && neetPathNext && neetPathContainer) {
                neetPathNext.addEventListener('click', () => {
                    neetPathContainer.scrollBy({ left: 200, behavior: 'smooth' });
                });

                neetPathPrev.addEventListener('click', () => {
                    neetPathContainer.scrollBy({ left: -200, behavior: 'smooth' });
                });
            }
        }

        // Streak Calendar
        function initStreakCalendar() {
            const calendars = document.querySelectorAll('.streak-calendar');
            
            calendars.forEach(calendar => {
                const today = new Date();
                const daysInWeek = 7;
                
                let html = '';
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(today.getDate() - i);
                    
                    const dayOfWeek = date.getDay();
                    const dayName = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][dayOfWeek];
                    const isToday = i === 0;
                    const hasStreak = Math.random() > 0.3; // Random for demo
                    
                    html += `
                        <div class="calendar-day ${hasStreak ? 'streak' : ''} ${isToday ? 'today' : ''}">
                            ${dayName}
                        </div>
                    `;
                }
                
                calendar.innerHTML = html;
            });
        }

        // Initialize everything when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize trackers for both exams
            window.tracker = {
                jee: new ProgressTracker('jee'),
                neet: new ProgressTracker('neet')
            };

            // Initialize all components
            initSectionObserver();
            animateProgressBars();
            initExamToggle();
            initChatAssistant();
            initStudyPath();
            initStreakCalendar();

            // Add interactive animations
            document.querySelectorAll('.interactive').forEach(element => {
                element.addEventListener('click', function() {
                    this.classList.add('success-animation');
                    setTimeout(() => {
                        this.classList.remove('success-animation');
                    }, 600);
                });
            });

            // Smooth scrolling for sidebar links
            document.querySelectorAll('.sidebar-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Update active state
                    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                    
                    const targetId = this.getAttribute('href').substring(1);
                    const targetSection = document.getElementById(targetId);
                    
                    if (targetSection) {
                        targetSection.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });

            // Update progress bars on scroll
            const progressObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateProgressBars();
                    }
                });
            }, { threshold: 0.5 });

            document.querySelectorAll('.progress-tracker').forEach(tracker => {
                progressObserver.observe(tracker);
            });

            console.log('StudyBuddy Dashboard initialized successfully!');
        });

        // Export for global access if needed
        window.ProgressTracker = ProgressTracker;