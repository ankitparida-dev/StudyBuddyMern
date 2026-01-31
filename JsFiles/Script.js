// ===== LOADING SCREEN FUNCTIONALITY =====
        document.addEventListener('DOMContentLoaded', function() {
            const loadingScreen = document.getElementById('loadingScreen');
            const mainContent = document.getElementById('mainContent');
            const progressBar = document.getElementById('progressBar');
            const loadedPercent = document.getElementById('loadedPercent');
            
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 10;
                if (progress > 100) progress = 100;
                
                progressBar.style.width = progress + '%';
                loadedPercent.textContent = Math.round(progress) + '%';
                
                if (progress === 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        // Hide loading screen and show main content
                        loadingScreen.classList.add('hidden');
                        mainContent.classList.add('visible');
                        
                        // Force reflow to ensure smooth transition
                        void mainContent.offsetWidth;
                        
                        // Start other animations and functionality
                        startTypingAnimation();
                        initializeThemeToggle();
                        initializeChatAssistant();
                        initializeInteractiveElements();
                    }, 500);
                }
            }, 200);
        });

        // ===== TYPING ANIMATION =====
        function startTypingAnimation() {
            const typeText = document.getElementById('type-text');
            if (!typeText) return;

            const texts = [
                "Personalized Learning Paths",
                "AI-Powered Study Plans", 
                "Smart Progress Tracking",
                "Time Management Tools"
            ];
            
            let textIndex = 0;
            let charIndex = 0;
            let isDeleting = false;
            
            function type() {
                const currentText = texts[textIndex];
                
                if (isDeleting) {
                    typeText.textContent = currentText.substring(0, charIndex - 1);
                    charIndex--;
                } else {
                    typeText.textContent = currentText.substring(0, charIndex + 1);
                    charIndex++;
                }
                
                if (!isDeleting && charIndex === currentText.length) {
                    isDeleting = true;
                    setTimeout(type, 2000);
                } else if (isDeleting && charIndex === 0) {
                    isDeleting = false;
                    textIndex = (textIndex + 1) % texts.length;
                    setTimeout(type, 500);
                } else {
                    setTimeout(type, isDeleting ? 50 : 100);
                }
            }
            
            setTimeout(type, 1000);
        }

        // ===== THEME TOGGLE FUNCTIONALITY =====
        function initializeThemeToggle() {
            const themeToggle = document.getElementById('theme-toggle');
            
            if (themeToggle) {
                // Check for saved theme preference or default to light
                const currentTheme = localStorage.getItem('theme') || 'light';
                if (currentTheme === 'dark') {
                    document.body.classList.add('dark-mode');
                    themeToggle.checked = true;
                }
                
                themeToggle.addEventListener('change', function() {
                    if (this.checked) {
                        document.body.classList.add('dark-mode');
                        localStorage.setItem('theme', 'dark');
                    } else {
                        document.body.classList.remove('dark-mode');
                        localStorage.setItem('theme', 'light');
                    }
                });
            }
        }

        // ===== AI CHAT ASSISTANT FUNCTIONALITY (GEMINI WIRED) =====
class ChatAssistant {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    init() {
        this.toggleBtn = document.getElementById('chatToggle');
        this.closeBtn = document.getElementById('closeChat');
        this.chatWindow = document.getElementById('chatWindow');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendMessage');

        // Check if all elements exist
        if (!this.toggleBtn || !this.chatWindow) {
            console.log('Chat elements not found - chat disabled');
            return;
        }

        this.setupEventListeners();
        this.addWelcomeMessage();
    }

    setupEventListeners() {
        // Toggle chat window
        this.toggleBtn.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.closeChat());

        // Send message on button click
        this.sendBtn.addEventListener('click', () => this.sendMessage());

        // Send message on Enter key
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Quick action buttons
        const quickButtons = document.querySelectorAll('.quick-btn');
        quickButtons.forEach(button => {
            button.addEventListener('click', () => {
                const question = button.getAttribute('data-question');
                this.sendQuickQuestion(question);
            });
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.chatWindow.classList.toggle('active', this.isOpen);
        
        if (this.isOpen) {
            this.chatInput.focus();
            // Hide notification dot when opened
            const notificationDot = document.querySelector('.notification-dot');
            if (notificationDot) {
                notificationDot.style.display = 'none';
            }
        }
    }

    closeChat() {
        this.isOpen = false;
        this.chatWindow.classList.remove('active');
    }

    addWelcomeMessage() {
        this.scrollToBottom();
    }

    // <-- NEW: This function now calls your Flask backend
    async getGeminiResponse(promptText) {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: promptText,
          }),
        });
    
        const data = await response.json();
    
        if (response.ok) {
          return data.response; // Return the bot's clean text
        } else {
          console.error('API Error:', data.error);
          return "Oops! I hit a snag on my side. Please try again.";
        }
      } catch (error) {
        console.error('Fetch Error:', error);
        return "I'm having trouble connecting... is the Flask server running?";
      }
    }

    // <-- UPDATED: This function is now async
    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        this.chatInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        // <-- UPDATED: Get REAL response from Gemini via Flask
        const botResponse = await this.getGeminiResponse(message);
        
        this.removeTypingIndicator();
        this.addMessage(botResponse, 'ai');
    }

    // <-- UPDATED: This function is now async
    async sendQuickQuestion(question) {
        if (question) {
            this.addMessage(question, 'user');
            
            // Show typing indicator
            this.showTypingIndicator();

            // <-- UPDATED: Get REAL response from Gemini via Flask
            const botResponse = await this.getGeminiResponse(question);

            this.removeTypingIndicator();
            this.addMessage(botResponse, 'ai');
        }
    }
    
    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = `<i class="fas ${sender === 'user' ? 'fa-user' : 'fa-robot'}"></i>`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const messageP = document.createElement('p');
        // <-- NEW: We call formatMessage to handle markdown from Gemini
        messageP.innerHTML = this.formatMessage(content); 
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        contentDiv.appendChild(messageP);
        contentDiv.appendChild(timeSpan);
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        this.chatMessages.appendChild(messageDiv);
        this.messages.push({ content, sender, time: timeSpan.textContent });
        this.scrollToBottom();
    }

    formatMessage(content) {
        // Convert line breaks and basic formatting (perfect for Gemini's responses)
        return content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // <-- DELETED: We don't need the fake `generateAIResponse` function anymore

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// <-- NEW: Make sure to initialize the class
// This should be at the end of your script, or inside a
// 'DOMContentLoaded' event listener.
document.addEventListener('DOMContentLoaded', () => {
    new ChatAssistant();
});

        // ===== INTERACTIVE ELEMENTS FUNCTIONALITY =====
        function initializeInteractiveElements() {
            // Auth buttons functionality
            const authButtons = document.querySelectorAll('.header-controls .btn');
            authButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (this.classList.contains('btn-primary')) {
                        alert('Redirecting to sign up page...');
                        // window.location.href = 'Html Files/Login.html?action=signup';
                    } else {
                        alert('Redirecting to login page...');
                        // window.location.href = 'Html Files/Login.html?action=login';
                    }
                });
            });

            // Exam buttons functionality
            const examButtons = document.querySelectorAll('.exam-btn');
            examButtons.forEach(button => {
                button.addEventListener('click', function() {
                    if (this.classList.contains('jee-btn')) {
                        alert('Starting JEE preparation journey...');
                        // Add JEE specific redirection logic here
                    } else {
                        alert('Starting NEET preparation journey...');
                        // Add NEET specific redirection logic here
                    }
                });
            });

            // Navigation links
            const navLinks = document.querySelectorAll('.nav-links a');
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    if (this.getAttribute('href') === '#' || !this.getAttribute('href').includes('.html')) {
                        e.preventDefault();
                        const section = this.textContent.toLowerCase();
                        alert(`Navigating to ${section} section...`);
                        // Add smooth scroll or section display logic here
                    }
                });
            });

            // Diary functionality
            initializeDiaryInteractions();
        }

        // ===== DIARY INTERACTIONS =====
        function initializeDiaryInteractions() {
            // Mood selection
            const moodOptions = document.querySelectorAll('.mood-option');
            moodOptions.forEach(option => {
                option.addEventListener('click', function() {
                    const parent = this.parentElement;
                    parent.querySelectorAll('.mood-option').forEach(opt => {
                        opt.classList.remove('active');
                    });
                    this.classList.add('active');
                    showNotification('Mood updated!');
                });
            });
            
            // Save diary entry
            const saveButton = document.getElementById('save-entry');
            if (saveButton) {
                saveButton.addEventListener('click', function() {
                    const entry = document.getElementById('today-entry');
                    entry.readOnly = true;
                    this.classList.add('success-animation');
                    setTimeout(() => {
                        this.classList.remove('success-animation');
                    }, 600);
                    showNotification('Diary entry saved successfully!');
                });
            }

            // Reset streak
            const resetStreakButton = document.getElementById('reset-streak');
            if (resetStreakButton) {
                resetStreakButton.addEventListener('click', function() {
                    const streakCount = document.getElementById('streak-count');
                    streakCount.textContent = '0';
                    this.classList.add('success-animation');
                    setTimeout(() => {
                        this.classList.remove('success-animation');
                    }, 600);
                    showNotification('Streak reset! Start fresh tomorrow.');
                });
            }

            // Toggle alerts
            const toggleAlertsButton = document.getElementById('toggle-alerts');
            if (toggleAlertsButton) {
                toggleAlertsButton.addEventListener('click', function() {
                    const reminderStatus = document.getElementById('reminder-status');
                    const progressStatus = document.getElementById('progress-status');
                    
                    if (reminderStatus.textContent === 'Active') {
                        reminderStatus.textContent = 'Inactive';
                        progressStatus.textContent = 'Inactive';
                        showNotification('Alerts disabled', 'error');
                    } else {
                        reminderStatus.textContent = 'Active';
                        progressStatus.textContent = 'Active';
                        showNotification('Alerts enabled!');
                    }
                    
                    this.classList.add('success-animation');
                    setTimeout(() => {
                        this.classList.remove('success-animation');
                    }, 600);
                });
            }

            // Update graph
            const updateGraphButton = document.getElementById('update-graph');
            if (updateGraphButton) {
                updateGraphButton.addEventListener('click', function() {
                    const graph = document.getElementById('progress-graph');
                    graph.textContent = 'Updated! Study Hours: 5h 30m';
                    this.classList.add('success-animation');
                    setTimeout(() => {
                        this.classList.remove('success-animation');
                    }, 600);
                    showNotification('Progress graph updated!');
                });
            }

            // Feature buttons
            const featureButtons = document.querySelectorAll('.feature-card .btn');
            featureButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const featureTitle = this.closest('.feature-card').querySelector('.feature-title').textContent;
                    this.classList.add('success-animation');
                    setTimeout(() => {
                        this.classList.remove('success-animation');
                    }, 600);
                    showNotification(`${featureTitle} feature activated!`);
                });
            });
        }

        // ===== NOTIFICATION SYSTEM =====
        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `notification ${type === 'error' ? 'error' : ''}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-${type === 'error' ? 'exclamation' : 'check'}"></i>
                    <span>${message}</span>
                </div>
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

        // ===== INITIALIZE CHAT ASSISTANT =====
        function initializeChatAssistant() {
            setTimeout(() => {
                window.chatAssistant = new ChatAssistant();
                console.log('AI Chat Assistant initialized');
            }, 1000);
        }

        // ===== ADDITIONAL UTILITY FUNCTIONS =====

        // Smooth scrolling for anchor links
        function initializeSmoothScrolling() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
        }

        // Add CSS for typing animation
        function injectTypingAnimationCSS() {
            const typingCSS = `
                .typing-indicator .message-content {
                    background: transparent !important;
                    padding: 8px 16px;
                }

                .typing-dots {
                    display: flex;
                    gap: 4px;
                    padding: 10px 0;
                }

                .typing-dots span {
                    width: 8px;
                    height: 8px;
                    background: #64748b;
                    border-radius: 50%;
                    animation: typingBounce 1.4s infinite ease-in-out;
                }

                .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
                .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
                .typing-dots span:nth-child(3) { animation-delay: 0s; }

                @keyframes typingBounce {
                    0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                    40% { transform: scale(1.2); opacity: 1; }
                }

                .dark-mode .typing-dots span {
                    background: #94a3b8;
                }
            `;

            const style = document.createElement('style');
            style.textContent = typingCSS;
            document.head.appendChild(style);
        }
        // --- Function to call your Email API ---
// You can put this outside your ChatAssistant class

async function sendNotificationEmail(recipientEmail, subject, body) {
  try {
    const response = await fetch('http://127.0.0.1:5000/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: recipientEmail,
        subject: subject,
        body: body,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Email send success:', data.success);
      alert('Subscription successful! Check your inbox. 🚀');
    } else {
      console.error('Email API Error:', data.error);
      alert('Email failed to send. Check the console for details.');
    }
  } catch (error) {
    console.error('Email Fetch Error:', error);
    alert('Could not connect to the email server. Is Flask running?');
  }
}

// --- Hook up the Bell Icon ---
// We add this to the 'DOMContentLoaded' listener you already have

document.addEventListener('DOMContentLoaded', () => {
    // This next line initializes your chatbot
    new ChatAssistant(); 
    
    // --- NEW code for the bell icon ---
    const bellIcon = document.getElementById('notify-bell-icon');

    if (bellIcon) {
        bellIcon.addEventListener('click', () => {
            // Pop up a box to ask for the user's email
            const email = prompt("Enter your email to get study reminders:", "your-email@gmail.com");

            // Check if the user entered a valid-ish email
            if (email && email.includes('@')) {
                // Customize the email subject and body
                const subject = "You're subscribed to StudyBuddy Reminders! 🚀";
                const body = "Hey! You're all set to receive study tips, reminders, and motivation right in your inbox. Stay focused!";
                
                // Call our new function to send the email!
                sendNotificationEmail(email, subject, body);

            } else if (email) {
                // User entered something, but it wasn't an email
                alert("Please enter a valid email address.");
            } else {
                // User clicked "Cancel", so we do nothing.
            }
        });
    }
});

        // Initialize all functionality when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            injectTypingAnimationCSS();
            initializeSmoothScrolling();
        });