document.addEventListener("DOMContentLoaded", () => {
  fetchCourses();
  fetchTopics();

  document.getElementById("addTopicForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    await addTopic();
  });

  document.getElementById("toggleFormBtn").addEventListener("click", () => {
    const form = document.getElementById("addTopicForm");
    form.style.display = form.style.display === "none" ? "block" : "none";
  });

  document.getElementById("searchInput").addEventListener("input", () => {
    currentPage = 1;
    renderTopics();
  });
});

let allTopics = [];
let currentPage = 1;
const pageSize = 5;

// Fetch courses
async function fetchCourses() {
  try {
    const res = await fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Courses/all-courses");
    const courses = await res.json();
    const courseSelect = document.getElementById("courseSelect");
    const result = courses.data || [];
    courseSelect.innerHTML = result.map(c =>
      `<option value="${c.id}">${c.title}</option>`
    ).join('');
  } catch (err) {
    console.error("Error loading courses:", err);
  }
}

// Fetch topics
async function fetchTopics() {
  try {
    const res = await fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Topic/all-topics");
    allTopics = await res.json();
    renderTopics();
  } catch (err) {
    console.error("Error loading topics:", err);
  }
}

// Render topics with search and pagination
function renderTopics() {
  const tbody = document.querySelector("#topicsTable tbody");
  const search = document.getElementById("searchInput").value.toLowerCase();
  const result = allTopics.data || [];
  const filtered = result.filter(t => t.title.toLowerCase().includes(search));
  const totalPages = Math.ceil(filtered.length / pageSize);
  const start = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  tbody.innerHTML = "";
  paginated.forEach(topic => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${topic.title}</td>
      <td>${topic.durationHours}</td>
      <td>${topic.courseTitle}</td>
      <td class="actions">
        <button onclick="editTopic('${topic.id}')">Edit</button>
        <button onclick="removeTopic('${topic.id}')">Remove</button>
        <a href="/Topics/view-instructors-topic.html?topicId=${topic.id}">View Instructors</a>
        <a href="/Topics/Prerequistes-in-topic.html?topicId=${topic.id}">Prerequisites</a>
      </td>`;
    tbody.appendChild(tr);
  });

  const paginationDiv = document.getElementById("pagination");
  paginationDiv.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.disabled = i === currentPage;
    btn.onclick = () => {
      currentPage = i;
      renderTopics();
    };
    paginationDiv.appendChild(btn);
  }
}

// Add topic
async function addTopic() {
  const title = document.getElementById("title").value.trim();
  const duration = parseInt(document.getElementById("duration").value, 10);
  const courseId = document.getElementById("courseSelect").value;

  if (!title || !duration || !courseId) {
    Swal.fire("Error", "All fields are required.", "error");
    return;
  }

  try {
    const res = await fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Topic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, duration, courseId }),
    });

    if (res.ok) {
      Swal.fire("Success", "Topic added successfully.", "success");
      document.getElementById("addTopicForm").reset();
      document.getElementById("addTopicForm").style.display = "none";
      fetchTopics();
    } else {
      Swal.fire("Error", "Failed to add topic.", "error");
    }
  } catch (err) {
    console.error("Error adding topic:", err);
  }
}

// Edit
function editTopic(topicId) {
  window.location.href = `edit-topic.html?topicId=${topicId}`;
}

// Remove
async function removeTopic(topicId) {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This will permanently delete the topic.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel"
  });

  if (!result.isConfirmed) return;

  try {
    const res = await fetch(`https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Topic/${topicId}`, { method: "DELETE" });
    if (res.ok) {
      Swal.fire("Deleted", "Topic deleted successfully.", "success");
      fetchTopics();
    } else {
      Swal.fire("Error", "Failed to delete topic.", "error");
    }
  } catch (err) {
    console.error("Error deleting topic:", err);
  }
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
