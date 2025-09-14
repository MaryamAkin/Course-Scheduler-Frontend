document.addEventListener("DOMContentLoaded", () => {
  const topicsTableBody = document.getElementById("topicsTableBody");
  const paginationControls = document.getElementById("paginationControls");
  const courseTitleHeader = document.getElementById("courseTitleHeader");

  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("courseId");
  const courseTitle = urlParams.get("courseTitle") || "Course";
  courseTitleHeader.textContent = `Topics in "${courseTitle}"`;

  let allTopics = [];
  let currentPage = 1;
  const topicsPerPage = 5; // Change this for how many per page

  async function loadTopics() {
    try {
      const res = await fetch(`https://localhost:7295/api/Topic/course/${courseId}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
      });
      if (!res.ok) throw new Error("Failed to load topics");
      const result = await res.json();
      allTopics = result.data || [];
      renderPage(currentPage);
      renderPagination();
    } catch (err) {
      console.error("Error loading topics:", err);
      topicsTableBody.innerHTML = `<tr><td colspan="3">Error loading topics</td></tr>`;
    }
  }

  function renderPage(page) {
    topicsTableBody.innerHTML = "";
    const start = (page - 1) * topicsPerPage;
    const end = start + topicsPerPage;
    const topicsToShow = allTopics.slice(start, end);

    if (topicsToShow.length === 0) {
      topicsTableBody.innerHTML = `<tr><td colspan="3">No topics found</td></tr>`;
      return;
    }

    topicsToShow.forEach(topic => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${topic.title}</td>
        <td>${topic.durationHours}</td>
        <td>
        <button 
            class="view-btn" 
            data-id="${topic.id}" 
            data-title="${topic.title}">
            View Instructor
        </button>
        </td>
    `;
    topicsTableBody.appendChild(tr);
    });

    document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        const title = e.target.dataset.title;
        window.location.href = `/Student/view-instructors.html?topicId=${id}&topicTitle=${encodeURIComponent(title)}`;
    });
});

  }

  function renderPagination() {
    paginationControls.innerHTML = "";
    const totalPages = Math.ceil(allTopics.length / topicsPerPage);
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      if (i === currentPage) btn.classList.add("active");
      btn.addEventListener("click", () => {
        currentPage = i;
        renderPage(currentPage);
        renderPagination();
      });
      paginationControls.appendChild(btn);
    }
  }

  loadTopics();
});
