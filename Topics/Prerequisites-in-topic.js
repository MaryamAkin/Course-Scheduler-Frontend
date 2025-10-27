const apiUrl = "https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Topic";
const topicId = new URLSearchParams(window.location.search).get("topicId");
// const courseId = new URLSearchParams(window.location.search).get("courseId");
console.log( "topic id",topicId);

document.addEventListener("DOMContentLoaded", () => {
  if (!topicId) {
    Swal.fire("Error", "Topic ID is missing from the URL.", "error");
    return;
  }
  loadTopicTitle()
  loadPrerequisiteOptions();
  loadPrerequisiteList();

  document.getElementById("addPrerequisiteBtn").addEventListener("click", async () => {
  const selectedId = document.getElementById("prerequisiteSelect").value;

  if (!selectedId) {
    Swal.fire("Error", "Please select a prerequisite topic.", "warning");
    return;
  }

  const response = await fetch(`${apiUrl}/prerequisities/${topicId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prerequisiteTopicIds: [selectedId]
    })
  });

    if (response.ok) {
      Swal.fire("Success", "Prerequisite added successfully.", "success");
      loadPrerequisiteList();
    } else {
      Swal.fire("Error", "Failed to add prerequisite.", "error");
    }
  });
});

async function loadPrerequisiteOptions() {
  try {
    const res = await fetch(`${apiUrl}/topics-in-course/${topicId}`);
    const result = await res.json();
    const topics = result.data;

    if (!Array.isArray(topics) || topics.length === 0) {
      Swal.fire("No returning topics for the course");
    }

    const courseId = topics[0].courseId; // Assuming all topics are from the same course
    const select = document.getElementById("prerequisiteSelect");
    select.innerHTML = topics
      .filter(t => t.id !== topicId) // `t.id` may be missing, double-check backend
      .map(t => `<option value="${t.id}">${t.title}</option>`)
      .join("");

  } catch (err) {
    console.error("Error loading prerequisite options:", err);
    Swal.fire("Error", "Failed to load prerequisite options.", "error");
  }
}


async function loadPrerequisiteList() {
  try {
    const res = await fetch(`${apiUrl}/prereqisites/${topicId}`);
    const result = await res.json();
    const prerequisites = result.data || [];

    const tbody = document.getElementById("prerequisiteTableBody");
    tbody.innerHTML = "";

    for (const prereq of prerequisites) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${prereq.topicTitle}</td>
        <td><button onclick="removePrerequisite('${prereq.id}')" class="remove-btn">Remove</button></td>
      `;
      tbody.appendChild(row);
    }
  } catch (err) {
    console.error("Error loading prerequisites:", err);
    Swal.fire("Error", "Failed to load prerequisites.", "error");
  }
}
async function loadTopicTitle() {
  try {
    const res = await fetch(`${apiUrl}/${topicId}`);
    const result = await res.json();
    const topic = result.data;

    if (topic && topic.title && topic.courseTitle) {
      document.getElementById("topicTitleDisplay").innerText = `Topic: ${topic.title}`;
      document.getElementById("pageTitle").innerText = `Manage Prerequisites for "${topic.title}" in "${topic.courseTitle}"`;
    } else {
      document.getElementById("pageTitle").innerText = "Manage Prerequisites (Missing data)";
    }
  } catch (err) {
    console.error("Error loading topic title:", err);
    document.getElementById("pageTitle").innerText = "Error loading topic info";
  }
}


async function removePrerequisite(prerequisiteId) {
  const result = await Swal.fire({
    title: "Remove Prerequisite?",
    text: "Are you sure you want to remove this prerequisite?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Yes, remove it!",
    cancelButtonText: "Cancel"
  });

  if (!result.isConfirmed) return;

  // const res = await fetch(`${apiUrl}/${topicId}/remove-prerequisite/${prerequisiteId}`, {
  const res = await fetch(`${apiUrl}/prerequisites/${topicId}/${prerequisiteId}`, {
    method: "DELETE"
  });

  if (res.ok) {
    Swal.fire("Removed", "Prerequisite removed successfully.", "success");
    loadPrerequisiteList();
  } else {
    Swal.fire("Error", "Failed to remove prerequisite.", "error");
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
