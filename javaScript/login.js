window.addEventListener("load", () => {
  if (localStorage.getItem("loggedInUser")) {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser.role === "student") {
      window.location.href = "stud.html";
    } else if (loggedInUser.role === "teacher") {
      window.location.href = "teacher.html";
    } else if (loggedInUser.role === "admin") {
      window.location.href = "admin.html";
    }
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  const mobileLoginForm = document.getElementById("mobileLoginForm");
  if (mobileLoginForm) {
    mobileLoginForm.addEventListener("submit", handleLogin);
  }
});

function handleLogin(e) {
  e.preventDefault();

  let username, password;

  // Check which form is being submitted and get values from specific IDs
  if (e.target.id === "mobileLoginForm") {
    // Mobile form - use mobile-specific IDs
    const usernameInput = document.getElementById("mobileUserId");
    const passwordInput = document.getElementById("mobilePassword");
    
    if (!usernameInput || !passwordInput) {
      alert("Form elements not found");
      return;
    }
    
    username = usernameInput.value.trim();
    password = passwordInput.value.trim();
  } else {
    // Desktop modal form - use modal-specific IDs
    const usernameInput = document.getElementById("userId");
    const passwordInput = document.getElementById("password");
    
    if (!usernameInput || !passwordInput) {
      alert("Form elements not found");
      return;
    }
    
    username = usernameInput.value.trim();
    password = passwordInput.value.trim();
  }

  if (!username || !password) {
    alert("Please fill all fields");
    return;
  }

  fetch("https://mseufportal.onrender.com/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        const userData = {
          username: data.username,
          role: data.role,
        };

        if (data.role === "student") {
          userData.student_id = data.student_id;
        } else if (data.role === "teacher") {
          userData.teacher_id = data.teacher_id;
          userData.teacherUser_id = data.teacherUser_id;
        } else if (data.role === "admin") {
          userData.admin_id = data.admin_id;
          userData.full_name = data.full_name;
          userData.email = data.email;
          userData.phone = data.phone;
        }

        localStorage.setItem("loggedInUser", JSON.stringify(userData));

        if (data.role === "student") {
          window.location.href = "stud.html";
        } else if (data.role === "teacher") {
          window.location.href = "teacher.html";
        } else if (data.role === "admin") {
          window.location.href = "admin.html";
        }
      } else {
        alert(data.message || "Login failed");
      }
    })
    .catch((error) => {
      alert("Server error. Try again later.");
      console.error("Login error:", error);
    });
}

function togglePassword(event) {
  // Prevent form submission
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.getElementById("toggleIcon");

  if (passwordInput && toggleIcon) {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleIcon.classList.remove("fa-eye-slash");
      toggleIcon.classList.add("fa-eye");
    } else {
      passwordInput.type = "password";
      toggleIcon.classList.remove("fa-eye");
      toggleIcon.classList.add("fa-eye-slash");
    }
  }
  
  return false;
}

function toggleMobilePassword(event) {
  // Prevent form submission
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  const passwordInput = document.getElementById("mobilePassword");
  const toggleIcon = document.getElementById("mobileToggleIcon");

  if (passwordInput && toggleIcon) {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleIcon.classList.remove("fa-eye-slash");
      toggleIcon.classList.add("fa-eye");
    } else {
      passwordInput.type = "password";
      toggleIcon.classList.remove("fa-eye");
      toggleIcon.classList.add("fa-eye-slash");
    }
  }
  
  return false;
}

document.addEventListener("wheel", function (e) {
  e.preventDefault();
}, { passive: false });

document.addEventListener("touchmove", function (e) {
  e.preventDefault();
}, { passive: false });

document.addEventListener("keydown", function (e) {
  if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
    e.preventDefault();
  }
}, false);

function handleResize() {
  const modal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
  if (window.innerWidth <= 768 && modal) {
    modal.hide();
  }
}

window.addEventListener("resize", handleResize);