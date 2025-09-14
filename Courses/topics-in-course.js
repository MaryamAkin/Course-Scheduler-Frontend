const apiUrl = "https://localhost:7295/api/Topic";
const courseUrl = "https://localhost:7295/api/Courses/all-courses";

// const res = await fetch(apiUrl);
// const result = await res.json();
const courseIdFromQuery = new URLSearchParams(window.location.search).get("courseId");
console.log(courseIdFromQuery);
let allTopics = [];
let currentPage = 1;
const pageSize = 5;

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("topicModal");
  const addBtn = document.getElementById("addTopicBtn");
  const closeBtn = document.getElementById("closeModal");
  const topicForm = document.getElementById("topicForm");

  addBtn.onclick = () => openModal();
  closeBtn.onclick = () => modal.style.display = "none";
  window.onclick = e => { if (e.target == modal) modal.style.display = "none"; };

  document.getElementById("searchInput").addEventListener("input", () => {
    currentPage = 1;
    renderTopics();
  });

  document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTopics();
    }
  });

  document.getElementById("nextPage").addEventListener("click", () => {
    if (currentPage * pageSize < filteredTopics().length) {
      currentPage++;
      renderTopics();
    }
  });

  topicForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("topicId").value;
    const title = document.getElementById("topicTitle").value;
    // const description = document.getElementById("topicDescription").value;
    const courseId = document.getElementById("topicCourseId").value;
    // const courseId = courseIdFromQuery;
    const duration = parseInt(document.getElementById("topicDuration").value);

    const topicData = { title, courseId, duration };

    try {
      const method = id ? "PUT" : "POST";
      const url = id ? `${apiUrl}/${id}` : apiUrl;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...topicData })
      });

      if (!res.ok) throw new Error("Error saving topic");

      Swal.fire("Success", id ? "Topic updated" : "Topic added", "success");
      modal.style.display = "none";
      await loadTopics();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  });

  loadCourses();
  loadTopics();
});

async function loadCourses() {
  const res = await fetch(courseUrl);
  const courses = await res.json();
  const cour = courses.data || [];
  const courseSelect = document.getElementById("topicCourseId");
  courseSelect.innerHTML = cour.map(c => `<option value="${c.id}">${c.title}</option>`).join('');
}

async function loadTopics() {
    const courseId = new URLSearchParams(window.location.search).get("courseId");
  if (!courseId) {
    console.error("Course ID not found in query string.");
    return;
  }
   try {
    const res = await fetch(`${apiUrl}/course/${courseId}`);
    const result = await res.json();
    allTopics = result.data || [];

    renderTopics();
  } catch (error) {
    console.error("Failed to load topics for course:", error);
  }
//   const res = await fetch(`${apiUrl}/all-topics`);
//   const result = await res.json();
//   allTopics = result.data || [];
//   allTopics = await res.json();
//   renderTopics();
}

function filteredTopics() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  return allTopics.filter(t => t.title.toLowerCase().includes(keyword));
}

function renderTopics() {
  const tableBody = document.getElementById("topicsTableBody");
  tableBody.innerHTML = "";

  const topics = filteredTopics();
  const start = (currentPage - 1) * pageSize;
  const paged = topics.slice(start, start + pageSize);

  for (const topic of paged) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${topic.title}</td>
      <td>${topic.courseTitle || "N/A"}</td>
      <td>${topic.durationHours || 0}</td>
      <td>${topic.instructorCount || 0}</td>
      <td>
        <button onclick='editTopic(${JSON.stringify(topic)})'>Edit</button>
        <button style="background:sky blue;" onclick='deleteTopic("${topic.id}")'>Remove</button>
        <a href="/Topics/instructors-in-topic.html?topicId=${topic.id}">View Instructors</a>|
        <a href="/Topics/Prerequistes-in-topic.html?topicId=${topic.id}">Prerequisites</a>
      </td>
    `;
    tableBody.appendChild(row);
  }

  document.getElementById("pageInfo").innerText = `Page ${currentPage} of ${Math.ceil(topics.length / pageSize)}`;
}

function openModal(isEdit = false, topic = null) {
  const modal = document.getElementById("topicModal");
  modal.style.display = "block";
  document.getElementById("topicForm").reset();

  if (isEdit && topic) {
    document.getElementById("modalTitle").textContent = "Edit Topic";
    document.getElementById("topicId").value = topic.id;
    document.getElementById("topicTitle").value = topic.title;
    // document.getElementById("topicDescription").value = topic.description;
    document.getElementById("topicCourseId").value = topic.courseId;
    document.getElementById("topicDuration").value = topic.duration;
  } else {
    document.getElementById("modalTitle").textContent = "Add Topic";
  }
}

window.editTopic = (topic) => openModal(true, topic);

window.deleteTopic = async (id) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This topic will be permanently deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  });

  if (result.isConfirmed) {
    const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
    if (!res.ok) {
      Swal.fire("Error", "Failed to delete topic", "error");
    } else {
      Swal.fire("Deleted", "Topic deleted successfully", "success");
      await loadTopics();
    }
  }
};

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