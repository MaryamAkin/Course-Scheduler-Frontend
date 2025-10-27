document.addEventListener("DOMContentLoaded", () => {
  const batchesContainer = document.getElementById("batchesContainer");

  // Extract courseId from query string (?courseId=...)
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("courseId");

  if (!courseId) {
    batchesContainer.innerHTML = "<p>No course selected.</p>";
    return;
  }

  fetch(`https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Batches/${courseId}/instructors`, {
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("authToken")
    }
  })
    .then(res => res.json())
    .then(data => {
      const batches = data.data || [];
      if (batches.length === 0) {
        batchesContainer.innerHTML = "<p>No batches found for this course.</p>";
        return;
      }

      batchesContainer.innerHTML = "";
      batches.forEach(batch => {
        const card = document.createElement("div");
        card.classList.add("batch-card");

        let instructorsList = "";
        if (batch.instructors && batch.instructors.length > 0) {
          instructorsList = "<ul class='instructors-list'>" +
            batch.instructors.map(i => `<li><i class="fa-solid fa-chalkboard-teacher"></i> ${i.name}</li>`).join("") +
            "</ul>";
        } else {
          instructorsList = "<p><em>No instructors assigned</em></p>";
        }

        card.innerHTML = `
          <div class="batch-title">${batch.name}</div>
          ${instructorsList}
        `;

        batchesContainer.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Error fetching batches:", err);
      batchesContainer.innerHTML = "<p>Error loading batches.</p>";
    });
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});
