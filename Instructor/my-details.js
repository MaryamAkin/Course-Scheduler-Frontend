const baseUrl = "course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/";
const authToken = localStorage.getItem("authToken");

const studentNameEl = document.getElementById("instructorName");
const studentEmailEl = document.getElementById("instructorEmail");
const studentGenderEl = document.getElementById("instructorGender");
const studentPhoneEl = document.getElementById("instructorPhone");
const studentAvatarEl = document.getElementById("instructorAvatar");
const greetingEl = document.getElementById("greetingEl");

async function loadProfile() {
  try {
    const res = await fetch(`${baseUrl}api/Instructors/profile-currentuser`, {
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error("Failed to load profile");

    const result = await res.json();
    const profile = result.data || {};

    studentNameEl.textContent = profile.name || "Instructor";
    studentEmailEl.textContent = profile.email || "";
    studentGenderEl.textContent = profile.gender || "";
    studentBatchEl.textContent = profile.phoneNumber || "";
    studentAvatarEl.src = profile.profileImagePath 
      ? `${baseUrl}${profile.profileImagePath}` 
      : "/assets/default-avatar.png";

    greetingEl.textContent = `Welcome, ${profile.name || "Instructor"}`;
  } catch (err) {
    console.error("Profile load error:", err);
  }
}

// Edit Photo button click
document.getElementById("editPhotoBtn").addEventListener("click", () => {
  alert("Feature to change photo coming soon!");
});

// Sidebar link override for My Courses
// document.getElementById("myCoursesLink").addEventListener("click", (e) => {
//   e.preventDefault();
//   loadCourses(); // Your custom function
// });
document.getElementById("logoutBtn").addEventListener("click", function (e) {
    e.preventDefault();
    
    // Clear token (adjust key name if different)
    localStorage.removeItem("authToken");

    // Optionally clear other saved data
    // localStorage.removeItem("refreshToken");
    // localStorage.removeItem("userProfile");

    // Redirect to login page
    window.location.href = "/Sign/sign.html";
});
// Load profile on page load
loadProfile();
