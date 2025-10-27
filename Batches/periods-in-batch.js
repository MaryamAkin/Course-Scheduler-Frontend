console.log("✅ periods-in-batch.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const batchId = new URLSearchParams(window.location.search).get("batchId");
  console.log("✅ DOMContentLoaded fired");

  if (!batchId) {
    Swal.fire("Error", "Batch ID not found in URL!", "error");
    return;
  }

  console.log(batchId);
  loadPeriods(batchId);
  loadInstructors();
  loadTopics(batchId);

  document.getElementById("addPeriodBtn").addEventListener("click", () => {
    document.getElementById("addPeriodModal").classList.remove("hidden");
  });
  // document.getElementById("runSchedulerBtn").addEventListener("click", () => {
  //   const progressDiv = document.getElementById("schedulerProgress");
  //   const progressBar = document.getElementById("progressBar");
  document.getElementById("runSchedulerBtn").addEventListener("click", () => {
  const progressDiv = document.getElementById("schedulerProgress");
  const progressBar = document.getElementById("progressBar");

  progressDiv.style.display = "block";
  progressBar.style.width = "0%";
  progressBar.textContent = "0%";

  let fakeProgress = 0;
  const interval = setInterval(() => {
    if (fakeProgress < 90) {
      fakeProgress += 10;
      progressBar.style.width = fakeProgress + "%";
      progressBar.textContent = fakeProgress + "%";
    }
  }, 500);

  fetch(`https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Scheduler/schedule/${batchId}`, { method: "POST" })
    .then(res => res.json())
    .then(response => {
      clearInterval(interval);
      progressBar.style.width = "100%";
      progressBar.textContent = "100%";

      if (!response.status) {
        Swal.fire("Error", response.message, "error");
        return;
      }

      const data = response.data;

      // Scheduled periods
      let scheduled = data.scheduledPeriods?.map(p => 
        `✅ ${p.topicTitle} (${p.instructorName}, ${new Date(p.startTime).toLocaleString()} - ${new Date(p.endTime).toLocaleString()})`
      ).join("<br>") || "None";

      let unscheduled = data.unscheduledTopics?.map(t => {
        // If t is an object, extract the title property (adjust property name as needed)
        if (typeof t === 'object' && t !== null) {
          return `❌ ${t.title || t.name || t.topicTitle || JSON.stringify(t)}`;
        }
        return `❌ ${t}`;
      }).join("<br>") || "None";

      Swal.fire({
        title: response.message,
        html: `
          <strong>Scheduled Periods:</strong><br>${scheduled}<br><br>
          <strong>Unscheduled Topics:</strong><br>${unscheduled}
        `,
        icon: "info",
        width: 600
      });

      loadPeriods(batchId);
    })
    .catch(error => {
      clearInterval(interval);
      console.error('Scheduler error:', error); // Added for debugging
      Swal.fire("Error", "Could not start scheduler", "error");
    });
});

  // document.getElementById("runSchedulerBtn").addEventListener("click", () => {
  //   const progressDiv = document.getElementById("schedulerProgress");
  //   const progressBar = document.getElementById("progressBar");

  //   progressDiv.style.display = "block";
  //   progressBar.style.width = "0%";
  //   progressBar.textContent = "0%";

  //   let fakeProgress = 0;
  //   const interval = setInterval(() => {
  //     if (fakeProgress < 90) {
  //       fakeProgress += 10;
  //       progressBar.style.width = fakeProgress + "%";
  //       progressBar.textContent = fakeProgress + "%";
  //     }
  //   }, 500);

  //   fetch(`https://localhost:7295/api/Scheduler/schedule/${batchId}`, { method: "POST" })
  //     .then(res => {
  //       clearInterval(interval);
  //       if (res.ok) {
  //         progressBar.style.width = "100%";
  //         progressBar.textContent = "100%";
  //         Swal.fire("Scheduler generated successfully!", "", "success");
  //         loadPeriods(batchId);
  //       } else {
  //         throw new Error("Scheduler failed");
  //       }
  //     })
  //     .catch(() => {
  //       clearInterval(interval);
  //       Swal.fire("Error", "Could not start scheduler", "error");
  //     });
  // });
}); // ✅ properly closes DOMContentLoaded

// -------------------- Pagination & Table --------------------
let currentPage = 1;
const pageSize = 10;

function loadPeriods(batchId, page = 1) {
  const tbody = document.getElementById("periodsTableBody");
  tbody.innerHTML = "";

  fetch(`https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Periods/${batchId}?CurrentPage=${page}&PageSize=${pageSize}`)
    .then(res => res.json())
    .then(data => {
      const periods = data.data.items || [];
      const totalPages = data.data.totalPages || 1;
      // document.getElementById("courseTitle").innerText = data.data.courseTitle || "No Course Title";
      if (periods.length > 0) {
    document.getElementById("courseTitle").innerText = periods[0].courseTitle;
    } else {
      document.getElementById("courseTitle").innerText = "No Course Title";
    }

      // ✅ Show Course Title (assuming API response includes courseTitle & batchName in data.data)
      // if (data.data.courseTitle) {
      //   document.getElementById("courseTitle").innerText = data.data.courseTitle;
      // }
      // if (data.data.batchName) {
      //   document.getElementById("courseTitle").innerText += ` - ${data.data.batchName}`;
      // }

      if (periods.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">No upcoming classes</td></tr>`;
      } else {
        periods.forEach(period => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${period.instructorName || "N/A"}</td>
            <td>${period.topicTitle}</td>
            <td>${period.startTime}</td>
            <td>${period.endTime}</td>
            <td>
              <button onclick="editPeriod('${period.id}')">Edit</button>
              <button onclick="deletePeriod('${period.id}')">Remove</button>
            </td>
          `;
          tbody.appendChild(row);
        });
      }

      renderPagination(batchId, page, totalPages);
    })
    .catch(err => {
      console.error("Failed to load periods:", err);
      tbody.innerHTML = `<tr><td colspan="5">Error loading periods</td></tr>`;
    });
}

function renderPagination(batchId, page, totalPages) {
  const pagination = document.getElementById("paginationControls");
  pagination.innerHTML = "";

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Previous";
  prevBtn.disabled = page === 1;
  prevBtn.onclick = () => loadPeriods(batchId, page - 1);
  pagination.appendChild(prevBtn);

  const pageInfo = document.createElement("span");
  pageInfo.textContent = ` Page ${page} of ${totalPages} `;
  pagination.appendChild(pageInfo);

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.disabled = page === totalPages;
  nextBtn.onclick = () => loadPeriods(batchId, page + 1);
  pagination.appendChild(nextBtn);
}

// -------------------- Supporting Functions --------------------
function loadTopics(batchId) {
  fetch(`https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Batches/Topics/${batchId}`)
    .then(res => res.json())
    .then(topics => {
      const top = topics.data || [];
      const select = document.getElementById("topicSelect");
      select.innerHTML = '<option value="">-- Select Topic --</option>';
      top.forEach(topic => {
        const option = document.createElement("option");
        option.value = topic.id;
        option.textContent = topic.title;
        select.appendChild(option);
      });
    })
    .catch(() => {
      Swal.fire("Error", "Failed to load topics for this batch", "error");
    });
}

function loadInstructors() {
  fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Instructors/instructors")
    .then(res => res.json())
    .then(instructors => {
      const select1 = document.getElementById("instructorSelect");
      const select2 = document.getElementById("editInstructorSelect");
      const instroctors = instructors.data || [];
      [select1, select2].forEach(select => {
        select.innerHTML = '<option value="">-- Select Instructor --</option>';
        instroctors.forEach(ins => {
          const option = document.createElement("option");
          option.value = ins.id;
          option.textContent = ins.name;
          select.appendChild(option);
        });
      });
    });
}

function closeAddPeriodModal() {
  document.getElementById("addPeriodModal").classList.add("hidden");
}

function submitNewPeriod() {
  const batchId = new URLSearchParams(window.location.search).get("batchId");
  const date = document.getElementById("newPeriodDate").value;
  const startTime = document.getElementById("newPeriodStartTime").value;
  const endTime = document.getElementById("newPeriodEndTime").value;

  const startDateTime = `${date}T${startTime}:00`;
  const endDateTime = `${date}T${endTime}:00`;

  const data = {
    startTime: startDateTime,
    endTime: endDateTime,
    instructorId: document.getElementById("instructorSelect").value,
    topicId: document.getElementById("topicSelect").value,
    batchId: batchId
  };

  fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Periods", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => {
      if (res.ok) {
        Swal.fire("Added!", "Period added successfully.", "success");
        closeAddPeriodModal();
        loadPeriods(batchId);
      } else {
        throw new Error("Failed to add");
      }
    })
    .catch(() => Swal.fire("Error", "Could not add period", "error"));
}

function editPeriod(id) {
  fetch(`https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Periods/${id}`)
    .then(res => res.json())
    .then(period => {
      document.getElementById("editPeriodId").value = id;
      document.getElementById("editPeriodDate").value = period.date;
      document.getElementById("editPeriodStartTime").value = period.startTime;
      document.getElementById("editPeriodEndTime").value = period.endTime;
      document.getElementById("editInstructorSelect").value = period.instructorId;

      document.getElementById("editPeriodModal").classList.remove("hidden");
    });
}

function savePeriodEdit() {
  const id = document.getElementById("editPeriodId").value;
  const batchId = new URLSearchParams(window.location.search).get("batchId");

  const data = {
    id: id,
    date: document.getElementById("editPeriodDate").value,
    startTime: document.getElementById("editPeriodStartTime").value,
    endTime: document.getElementById("editPeriodEndTime").value,
    instructorId: document.getElementById("editInstructorSelect").value
  };

  fetch(`https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Periods/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => {
      if (res.ok) {
        Swal.fire("Updated!", "Period updated successfully.", "success");
        document.getElementById("editPeriodModal").classList.add("hidden");
        loadPeriods(batchId);
      } else {
        throw new Error("Failed to update");
      }
    })
    .catch(() => Swal.fire("Error", "Could not update period", "error"));
}

function closeEditPeriodModal() {
  document.getElementById("editPeriodModal").classList.add("hidden");
}

function deletePeriod(id) {
  const batchId = new URLSearchParams(window.location.search).get("batchId");

  Swal.fire({
    title: "Are you sure?",
    text: "This will remove the period permanently.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!"
  }).then(result => {
    if (result.isConfirmed) {
      fetch(`https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Periods/${id}`, {
        method: "DELETE"
      })
        .then(res => {
          if (res.ok) {
            Swal.fire("Deleted!", "The period was removed.", "success");
            loadPeriods(batchId);
          } else {
            throw new Error("Failed to delete");
          }
        })
        .catch(() => Swal.fire("Error", "Could not delete period", "error"));
    }
  });
}

document.getElementById("logoutBtn").addEventListener("click", function (e) {
  e.preventDefault();
  localStorage.removeItem("authToken");
  window.location.href = "/Sign/sign.html";
});
