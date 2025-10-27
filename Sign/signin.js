// Function to validate login fields
function showErrorMessage(message) {
  let errorDiv = document.getElementById("error-message");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
}
function loginValidation(email, password) {
    let isValid = true;
  
    if (!email.value.trim()) {
      showErrorMessage("Email is required.");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email.value)) {
      showErrorMessage("Invalid email format.");
      isValid = false;
    }
  
    if (!password.value.trim()) {
      showErrorMessage("Password is required.");
      isValid = false;
    } else if (password.value.length < 6) {
      showErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    }
  
    return isValid;
}
  
  let loginForm = document.querySelector("#loginForm");
  
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = document.getElementById("email");
    const password = document.getElementById("password");
  
    let isValid = loginValidation(email, password);
    if (isValid) {
      let loginData = {
        email: email.value,
        password: password.value,
      };
  
      try {
        let token = await login(loginData); // Get token after login
        if (token) {
          const user = jwt_decode(token);
          let userRole = user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
          console.log(userRole);
  
          if (userRole === "Admin") {
            window.location.href = "/Admin/admin-dashboard.html";
          } if (userRole === "Instructor") {
            window.location.href = "/Instructor/instructor-dashboard.html";
          }
          if(userRole == "Student")
            window.location.href = "/Student/student-dashboard.html"
        }
      } catch (error) {
        console.error("Login failed:", error);
      }
  
      loginForm.reset();
    }
  });
  
  let login = async (loginData) => {
    try {
      let res = await fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Auth/app-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });
  
      if (!res.ok) {
        let errorMessage = await res.text();
        throw new Error(errorMessage);
      }
  
      let response = await res.json();
      localStorage.setItem("authToken", response.token);
      return response.token; // Return token for use in login function
    } catch (error) {
      alert("Error: " + error.message);
      return null;
    }
  };
  