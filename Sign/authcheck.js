document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    alert("Unauthorized. Redirecting to login...");
    window.location.href = "/Sign/sign.html";
    return;
  }

  const payload = decodeJWT(token);
  if (!payload || !payload.role) {
    alert("Invalid session. Please log in again.");
    localStorage.clear();
    window.location.href = "/Sign/sign.html";
    return;
  }

  // Example: Only allow Admins
  const allowedRoles = ["Admin"];
  const userRole = payload.role;

  if (!allowedRoles.includes(userRole)) {
    alert("Access denied for role: " + userRole);
    window.location.href = "/unauthorized.html";
  }

  // Optionally store user ID/role in localStorage
  localStorage.setItem("userRole", userRole);
  localStorage.setItem("userId", payload.userId || payload.nameid);
});
