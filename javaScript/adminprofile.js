const API_URL = 'https://mseufportal.onrender.com';

let generatedOtp = null;
let otpExpiryTime = null;
let countdownInterval = null;

window.addEventListener("load", () => {
    loadAdminProfile();
    setupOtpButton();
});

function loadAdminProfile() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    console.log("Admin Profile - Logged in user:", loggedInUser);

    if (!loggedInUser || !loggedInUser.admin_id) {
        console.log("No logged-in admin found");
        window.location.href = "login.html";
        return;
    }

    const adminId = loggedInUser.admin_id;

    console.log("Fetching profile for admin_id:", adminId);

    fetch(`${API_URL}/admin/dashboard/${adminId}`, { mode: "cors" })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log("Admin profile data received:", data);
            
            if (data.full_name) {
                document.getElementById("adminName").innerText = data.full_name;
                
                const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name)}&background=800000&color=fff&size=100`;
                document.getElementById("profileAvatar").src = avatarUrl;
            }
            
            if (data.adminuser_id) {
                document.getElementById("adminId").innerText = `Admin ID: ${data.adminuser_id}`;
            }
            
            if (data.postion) {
                document.getElementById("position").innerText = `Position: ${data.postion}`;
            }
            
            if (data.email) {
                document.getElementById("email").innerText = `Email: ${data.email}`;
                document.getElementById("adminEmail").value = data.email;
            }

            if (data.username) {
                document.getElementById("username").value = data.username;
            }
        })
        .catch((error) => {
            console.error("Error fetching admin profile:", error);
            document.getElementById("adminName").innerText = "Error loading profile";
            document.getElementById("adminId").innerText = "Please refresh the page";
        });
}

function setupOtpButton() {
    document.getElementById('sendOtpBtn').addEventListener('click', sendOtp);
}

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendOtp() {
    const email = document.getElementById('adminEmail').value;
    
    if (!email) {
        showOtpMessage('error', 'Please enter your email address');
        return;
    }

    generatedOtp = generateOtp();
    otpExpiryTime = new Date().getTime() + 5 * 60 * 1000;

    console.log('Generated OTP:', generatedOtp);

    const sendBtn = document.getElementById('sendOtpBtn');
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Sending...';

    fetch(`${API_URL}/api/send-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            otp: generatedOtp
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showOtpMessage('success', `OTP sent to ${email}. Please check your inbox.`);
            startCountdown();
        } else {
            showOtpMessage('error', data.message || 'Failed to send OTP');
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane me-1"></i> Send OTP';
        }
    })
    .catch(error => {
        console.error('Error sending OTP:', error);
        showOtpMessage('error', 'Failed to send OTP. Please try again.');
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane me-1"></i> Send OTP';
    });
}

function startCountdown() {
    clearInterval(countdownInterval);
    
    countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = otpExpiryTime - now;

        if (distance <= 0) {
            clearInterval(countdownInterval);
            generatedOtp = null;
            showOtpMessage('error', 'OTP expired. Please request a new one.');
            
            const sendBtn = document.getElementById('sendOtpBtn');
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane me-1"></i> Send OTP';
        } else {
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            showOtpMessage('info', `OTP sent! Expires in: ${minutes}m ${seconds}s`);
        }
    }, 1000);
}

function showOtpMessage(type, message) {
    const messageDiv = document.getElementById('otpMessage');
    const alertClass = type === 'success' ? 'alert-success' : type === 'error' ? 'alert-danger' : 'alert-info';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    messageDiv.innerHTML = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            <i class="fas ${icon} me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}

document.getElementById('changePasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const enteredOtp = document.getElementById('otp').value;

    if (!generatedOtp) {
        showAlert('error', 'Please click "Send OTP" first');
        return;
    }

    if (new Date().getTime() > otpExpiryTime) {
        showAlert('error', 'OTP expired. Request a new one.');
        generatedOtp = null;
        clearInterval(countdownInterval);
        return;
    }

    if (enteredOtp !== generatedOtp) {
        showAlert('error', 'Invalid OTP. Please check and try again.');
        return;
    }

    if (newPassword.length < 8) {
        showAlert('error', 'New password must be at least 8 characters long');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showAlert('error', 'New password and confirmation do not match');
        return;
    }
    
    if (oldPassword === newPassword) {
        showAlert('error', 'New password must be different from current password');
        return;
    }
    
    const updateBtn = document.getElementById('updateBtn');
    updateBtn.disabled = true;
    updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Updating...';

    fetch(`${API_URL}/api/change-password-admin`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            oldPassword: oldPassword,
            newPassword: newPassword
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('success', data.message || 'Password changed successfully!');
            
            generatedOtp = null;
            clearInterval(countdownInterval);
            
            setTimeout(() => {
                document.getElementById('changePasswordForm').reset();
                document.getElementById('otpMessage').innerHTML = '';
                const sendBtn = document.getElementById('sendOtpBtn');
                sendBtn.disabled = false;
                sendBtn.innerHTML = '<i class="fas fa-paper-plane me-1"></i> Send OTP';
                
                updateBtn.disabled = false;
                updateBtn.innerHTML = '<i class="fas fa-save me-1"></i> Update Password';
                
                const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
                modal.hide();
            }, 1500);
        } else {
            showAlert('error', data.message || 'Failed to change password');
            updateBtn.disabled = false;
            updateBtn.innerHTML = '<i class="fas fa-save me-1"></i> Update Password';
        }
    })
    .catch(error => {
        console.error('Error changing password:', error);
        showAlert('error', 'An error occurred while changing password');
        updateBtn.disabled = false;
        updateBtn.innerHTML = '<i class="fas fa-save me-1"></i> Update Password';
    });
});

document.getElementById('changePasswordModal').addEventListener('hidden.bs.modal', function () {
    generatedOtp = null;
    clearInterval(countdownInterval);
    document.getElementById('changePasswordForm').reset();
    document.getElementById('otpMessage').innerHTML = '';
    const sendBtn = document.getElementById('sendOtpBtn');
    sendBtn.disabled = false;
    sendBtn.innerHTML = '<i class="fas fa-paper-plane me-1"></i> Send OTP';
    
    const updateBtn = document.getElementById('updateBtn');
    updateBtn.disabled = false;
    updateBtn.innerHTML = '<i class="fas fa-save me-1"></i> Update Password';
    
    const existingAlert = document.querySelector('#changePasswordModal .modal-body > .alert-dismissible');
    if (existingAlert) {
        existingAlert.remove();
    }
});

function showAlert(type, message) {
    const existingAlert = document.querySelector('#changePasswordModal .modal-body > .alert-dismissible');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    const alertHtml = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            <i class="fas ${icon} me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    const modalBody = document.querySelector('#changePasswordModal .modal-body');
    modalBody.insertAdjacentHTML('afterbegin', alertHtml);
    
    if (type === 'error') {
        setTimeout(() => {
            const alert = document.querySelector('#changePasswordModal .modal-body > .alert-dismissible');
            if (alert) {
                alert.remove();
            }
        }, 3000);
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    if (sidebar && overlay) {
        sidebar.classList.add("active");
        overlay.classList.add("active");
    }
}

function closeSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    if (sidebar && overlay) {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    }
}

function logout() {
    console.log("Logging out...");
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}