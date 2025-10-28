const params = new URLSearchParams(window.location.search);

// Check if token came from the URL (after Google login)
let tokenFromUrl = params.get("token");
// console.log(tokenFromUrl);
if (tokenFromUrl) {
  console.log("token from url",tokenFromUrl);
  // Save token to local storage for future requests
  localStorage.setItem("authToken", tokenFromUrl);

  // Remove the token from the URL so it’s clean
  window.history.replaceState({}, document.title, "/Student/student-dashboard.html");
} else {
  // If not in URL, try loading from local storage
  let authToken = localStorage.getItem("authToken");
  if (!authToken) {
    // No token at all — send to login page
    window.location.href = "/Sign/sign.html";
  }
}

const baseUrl = "https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/"; 
// DOM refs
const studentNameEl = document.getElementById("studentName");
const studentEmailEl = document.getElementById("studentEmail");
const studentAvatarEl = document.getElementById("studentAvatar");
const greetingEl = document.getElementById("greeting");

const enrolledCoursesEl = document.getElementById("enrolledCourses");
// const enrolledCourse = document.getElementById("course")
const completedLessonsEl = document.getElementById("completedLessons");
const upcomingCountEl = document.getElementById("upcomingCount");
// const pendingAssignmentsEl = document.getElementById("pendingAssignments");

const upcomingList = document.getElementById("upcomingList");
const coursesList = document.getElementById("coursesList");
const activityFeed = document.getElementById("activityFeed");

// Toggle quick actions
 const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('show');
    });
    document.addEventListener("click", (e) => {
  if (
    sidebar.classList.contains("show") &&
    !sidebar.contains(e.target) &&
    e.target !== menuToggle
  ) {
    sidebar.classList.remove("show");
  }
});
document.getElementById("toggleQuickActions").addEventListener("click", () => {
  document.getElementById("actionsContainer").classList.toggle("show");
});

// Quick action handlers
document.getElementById("quickJoin").addEventListener("click", async () => {
  // attempt to join the next class if a link exists
  try {
    const res = await fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Schedules/next-for-student", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
    });
    if (!res.ok) throw new Error("No upcoming class");
    const data = await res.json();
    if (data && data.meetingLink) {
      window.open(data.meetingLink, "_blank");
    } else {
      Swal.fire("No Meeting", "No join link available for your next class.", "info");
    }
  } catch (err) {
    Swal.fire("Error", "Unable to find next class.", "error");
  }
});

// document.getElementById("quickAssignments").addEventListener("click", () => {
//   window.location.href = "/Student/assignments.html";
// });

document.getElementById("quickContact").addEventListener("click", () => {
  Swal.fire({
    title: 'Contact Instructor',
    input: 'textarea',
    inputLabel: 'Message',
    inputPlaceholder: 'Write a short message to your instructor...',
    showCancelButton: true,
    preConfirm: (value) => {
      if(!value || !value.trim()) {
        Swal.showValidationMessage('Message is required');
      } else {
        return value.trim();
      }
    }
  }).then(result => {
    if (result.isConfirmed) {
      // Here you would send message to backend - placeholder:
      Swal.fire('Sent', 'Your message was sent to the instructor.', 'success');
    }
  });
});
document.getElementById("myCoursesLink").addEventListener("click", (e) => {
  e.preventDefault(); // stop navigation
  loadCourses()
});


// Load dashboard data
document.addEventListener("DOMContentLoaded", async () => {
  const hasBatch = await checkProfile();

  if (hasBatch) {
    // only load dashboard if batch exists
    loadProfile();
    loadStats();
    loadUpcoming();
    loadCourses();
    loadCalendar();
    // loadActivity();
  }
});

async function checkProfile() {
    const res = await fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Students/me", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
    });

    if (!res.ok) {
        console.error("Failed to fetch profile", res.status);
        return;
    }

    // Handle empty body safely
    let data = {};
    try {
        data = await res.json();
    } catch (err) {
        console.error("Invalid or empty JSON from backend", err);
        return;
    }

    // Now check the response
    if (!data.status && data.message === "Batch not set") {
        await loadBatches();
        document.getElementById("batchModal").style.display = "flex";
        return false;
    } else {
        console.log("Batch is set, continue to dashboard...");
        return true;
    }
}

async function loadBatches() {
    const res = await fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Batches/all-batches", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
    });
    const batches = await res.json();
    const result = batches.data || [];
    const dropdown = document.getElementById("batchDropdown");
    dropdown.innerHTML = '<option value="">-- Select a Batch --</option>';

    result.forEach(batch => {
        const opt = document.createElement("option");
        opt.value = batch.id;  
        opt.textContent = batch.name;
        dropdown.appendChild(opt);
    });
}

document.getElementById("saveBatchBtn").addEventListener("click", async () => {
    const batchId = document.getElementById("batchDropdown").value;
    if (!batchId) {
        alert("Please select a batch.");
        return;
    }

    await fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Students/update-batch", {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("authToken"),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ batchId })
    });

    alert("Batch updated successfully!");
    window.location.reload();
});

// Call checkProfile right after Google login
// checkProfile();

async function loadProfile() {
  try {
    const res = await fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Students/profile-currentuser", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
    });
    if (!res.ok) throw new Error("Failed to load profile");
    const result = await res.json();
    const profile = result.data || [];
    studentNameEl.textContent = profile.name || "Student";
    studentEmailEl.textContent = profile.email || "";
    // studentGenderE1.textContent = profile.gender || "";
    // studentBatchEl.textContent = profile.batchName || "";
    studentAvatarEl.src = `${baseUrl}${profile.imagePath}`|| "/assets/default-avatar.png";
    greetingEl.textContent = `Welcome, ${profile.name || "Student"}`;
  } catch (err) {
    console.error("Profile load error:", err);
  }
}

async function loadStats() {
  try {
    const res = await fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Students/student-stats", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
    });
    if (!res.ok) throw new Error("Failed to load stats");
    const s = await res.json();
    // const s = result.
    enrolledCoursesEl.textContent = s.numberOfEnrolledCourses ?? 0;
    completedLessonsEl.textContent = s.completedLessons ?? 0;
    upcomingCountEl.textContent = s.upcomingClasses ?? 0;
    // pendingAssignmentsEl.textContent = s.pendingAssignments ?? 0;
  } catch (err) {
    console.error("Stats load error:", err);
  }
}

async function loadUpcoming() {
  try {
    const res = await fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Periods/student-upcoming", {
      headers: { 
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) throw new Error("Failed to load upcoming");
    
    const result = await res.json();
    const data = result.data || [];
    upcomingList.innerHTML = "";

    if (!data || data.length === 0) {
      upcomingList.innerHTML = "<li>No upcoming classes</li>";
      return;
    }

    data.forEach(item => {
      const li = document.createElement("li");

      // Left side - topic, instructor, date/time
      const left = document.createElement("div");
      left.innerHTML = `
        <strong>${item.topicTitle || 'Untitled Topic'}</strong><br/>
        <span class="muted">
          ${item.instructorName || 'Instructor'} —
          ${new Date(item.date).toLocaleDateString()} 
          ${item.startTime} - ${item.endTime}
        </span>
      `;

      // Right side - Join link if present
      const right = document.createElement("div");
      if (item.meetingLink) {
        const btn = document.createElement("button");
        btn.textContent = "Join";
        btn.className = "join-btn";
        btn.addEventListener("click", () => window.open(item.meetingLink, "_blank"));
        right.appendChild(btn);
      } else {
        right.innerHTML = `<span class="muted">No link</span>`;
      }

      li.appendChild(left);
      li.appendChild(right);
      upcomingList.appendChild(li);
    });

  } catch (err) {
    console.error("Upcoming load error:", err);
    upcomingList.innerHTML = "<li>Error loading upcoming classes</li>";
  }
}


async function loadCourses() {
  try {
    const res = await fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Courses/student-course", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
    });
    if (!res.ok) throw new Error("Failed to load courses");

    const result = await res.json();
    const course = result.data;

    coursesList.innerHTML = "";

    if (!course) {
      coursesList.innerHTML = "<p>No enrolled courses</p>";
      return;
    }

    const div = document.createElement("div");
    div.className = "course-card";
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    div.style.padding = "10px";
    div.style.border = "1px solid #ddd";
    div.style.borderRadius = "8px";
    div.style.marginBottom = "10px";

    div.innerHTML = `
      <strong>${course.title}</strong>
      <button 
        class="btn-view-course" 
        data-id="${course.id}" 
        style="background-color:#007BFF;color:white;border:none;padding:5px 12px;border-radius:5px;cursor:pointer">
        Open
      </button>
    `;

    coursesList.appendChild(div);

    document.querySelector(".btn-view-course").addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      window.location.href = `/Student/topics.html?courseId=${id}`;
    });

  } catch (err) {
    console.error("Courses load error:", err);
    coursesList.innerHTML = "<p>Error loading courses</p>";
  }
}
function loadCalendar() {
    const calendarFrame = document.getElementById("calendarFrame");
    const connectBtn = document.getElementById("connectCalendarBtn");

    fetch("course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/calendar/my-calendar-id", {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error("Not connected");
        return response.json();
    })
    .then(data => {
        const calendarId = encodeURIComponent(data.calendarId);
        calendarFrame.src = `https://calendar.google.com/calendar/embed?src=${calendarId}&ctz=Africa/Lagos`;
        calendarFrame.style.display = "block";
        connectBtn.style.display = "none";
    })
    .catch(() => {
        // Show connect button if calendar not connected
        calendarFrame.style.display = "none";
        connectBtn.style.display = "inline-block";
    });

    // ✅ Connect Google Calendar
    connectBtn.addEventListener("click", () => {
        window.location.href = "https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Auth/google-login";
    });
}
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

// const needed = <small class="muted">${c.instructorName || ""}</small>
// <div class="progress-bar"><div class="progress-fill" style="width:${(c.progressPercent||0)}%"></div></div>
//           <small class="muted">${c.progressPercent || 0}% complete</small>
// async function loadActivity() {
//   try {
//     const res = await fetch("https://localhost:7295/api/Activity/recent-for-student", {
//       headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
//     });
//     if (!res.ok) throw new Error("Failed to load activity");
//     const data = await res.json();
//     activityFeed.innerHTML = "";
//     if (!data || data.length === 0) {
//       activityFeed.innerHTML = "<li>No recent activity</li>";
//       return;
//     }
//     data.forEach(a => {
//       const li = document.createElement("li");
//       li.textContent = `${a.message} — ${new Date(a.date).toLocaleString()}`;
//       activityFeed.appendChild(li);
//     });
//   } catch (err) {
//     console.error("Activity load error:", err);
//     activityFeed.innerHTML = "<li>Error loading activity</li>";
//   }
// }
