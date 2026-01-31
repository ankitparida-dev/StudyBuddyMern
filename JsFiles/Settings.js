  // Theme Toggle Functionality
        const themeToggle = document.getElementById('theme-toggle');
        const currentTheme = localStorage.getItem('theme') || 'light';

        if (currentTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.checked = true;
        }

        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
                showNotification('Dark mode enabled');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
                showNotification('Light mode enabled');
            }
        });

        // Interactive Elements
        const interactiveElements = document.querySelectorAll('.interactive');
        interactiveElements.forEach(element => {
            element.addEventListener('click', function() {
                this.classList.add('success-animation');
                setTimeout(() => {
                    this.classList.remove('success-animation');
                }, 600);
            });
        });

        // Form Controls Interactions
        const formControls = document.querySelectorAll('.form-control, .select-control');
        formControls.forEach(control => {
            control.addEventListener('focus', function() {
                this.parentElement.classList.add('success-animation');
                setTimeout(() => {
                    this.parentElement.classList.remove('success-animation');
                }, 600);
            });
        });

        // Checkbox Interactions
        const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const label = this.nextElementSibling.textContent;
                const status = this.checked ? 'enabled' : 'disabled';
                showNotification(`${label} ${status}`);
                
                this.closest('.checkbox-group').classList.add('success-animation');
                setTimeout(() => {
                    this.closest('.checkbox-group').classList.remove('success-animation');
                }, 600);
            });
        });

        // Save Button Functionality
        const saveButton = document.getElementById('saveBtn');
        saveButton.addEventListener('click', function() {
            // Validate passwords if they are filled
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword && newPassword !== confirmPassword) {
                showNotification('New passwords do not match!', 'error');
                return;
            }
            
            if (newPassword && !currentPassword) {
                showNotification('Please enter current password to change password', 'error');
                return;
            }
            
            this.classList.add('success-animation');
            setTimeout(() => {
                this.classList.remove('success-animation');
            }, 600);
            
            showNotification('Settings saved successfully!');
            
            // Simulate API call delay
            setTimeout(() => {
                // Reset password fields
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
            }, 1000);
        });

        // Cancel Button Functionality
        const cancelButton = document.getElementById('cancelBtn');
        cancelButton.addEventListener('click', function() {
            if (confirm('Are you sure you want to discard all changes?')) {
                // Reset form to original values
                document.getElementById('fullName').value = 'Rahul Sharma';
                document.getElementById('email').value = 'rahul.sharma@example.com';
                document.getElementById('phone').value = '+91 98765 43210';
                document.getElementById('class').value = '12';
                document.getElementById('examType').value = 'jee';
                document.getElementById('language').value = 'english';
                document.getElementById('dailyGoal').value = '4';
                document.getElementById('pomodoroDuration').value = '25';
                document.getElementById('breakDuration').value = '5';
                
                // Reset checkboxes
                document.getElementById('notifications').checked = true;
                document.getElementById('weeklyReport').checked = true;
                document.getElementById('aiRecommendations').checked = true;
                document.getElementById('distractionFree').checked = true;
                document.getElementById('autoPause').checked = true;
                
                // Clear password fields
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
                
                this.classList.add('success-animation');
                setTimeout(() => {
                    this.classList.remove('success-animation');
                }, 600);
                
                showNotification('Changes discarded');
            }
        });

        // Profile Section Interaction
        const profileSection = document.querySelector('.profile-section');
        profileSection.addEventListener('click', function() {
            showNotification('Profile picture updated successfully!');
        });

        // Notification System
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
            }, 3000);
        }

        // Auto-save functionality for form changes
        let autoSaveTimeout;
        const formInputs = document.querySelectorAll('input, select');
        formInputs.forEach(input => {
            input.addEventListener('input', function() {
                clearTimeout(autoSaveTimeout);
                autoSaveTimeout = setTimeout(() => {
                    if (this.type !== 'password') {
                        showNotification('Changes auto-saved');
                    }
                }, 2000);
            });
        });