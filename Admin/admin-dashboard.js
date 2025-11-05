const params = new URLSearchParams(window.location.search);
let authToken = params.get("token");

// ✅ Store token in localStorage if found in URL
if (authToken) {
    localStorage.setItem("authToken", authToken);
    // Redirect without token in query string
    window.history.replaceState({}, document.title, "/Admin/admin-dashboard.html");
    console.log("Auth Token from URL:", authToken);
} else {
    authToken = localStorage.getItem("authToken");
    if (!authToken) {
        window.location.href = "/Sign/sign.html";
        // return;
    }
}


document.addEventListener("DOMContentLoaded", () => {
  fetchData("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Students/count", "studentCount");
  fetchData("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Instructors/count", "instructorCount");
  fetchData("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Batches/count", "batchCount");
  fetchData("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Courses/count", "courseCount");
  loadRecentActivity()
  loadCalendar()
  loadUnassignedTopics()
  loadRecentRegistrations()
  loadNotifications()
});

// Quick Actions Toggle
document.getElementById("toggleQuickActions").addEventListener("click", () => {
  const actionsContainer = document.getElementById("actionsContainer");
  actionsContainer.classList.toggle("show");
});

const sidebar = document.querySelector('.sidebar');
const toggleBtn = document.getElementById('sidebarToggle');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});
document.addEventListener('click', (e) => {
  if (!sidebar.contains(e.target) && e.target !== toggleBtn) {
    sidebar.classList.remove('open');
  }
});

function fetchData(endpoint, elementId) {
  fetch(endpoint, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("authToken")}`
    }
  })
    .then(response => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then(data => {
      document.getElementById(elementId).textContent = data.count || "0";
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      document.getElementById(elementId).textContent = "Error";
    });
}
async function loadRecentRegistrations() {
    const list = document.getElementById("registrations-list");
    list.innerHTML = "<li>Loading...</li>";

    try {
        const res = await fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Students/recent");
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        list.innerHTML = "";

        if (data.length === 0) {
            list.innerHTML = "<li>No recent registrations</li>";
            return;
        }

        data.forEach(reg => {
            const li = document.createElement("li");
            const date = new Date(reg.dateCreated);
            const formattedDate = date.toISOString().split("T")[0]; 
            li.innerHTML = `<strong>${reg.name}</strong><span>${formattedDate}</span>`;
            list.appendChild(li);
        });
    } catch (err) {
        list.innerHTML = "<li>Error loading registrations</li>";
        console.error(err);
    }
}

async function loadNotifications() {
    const list = document.getElementById("notifications-list");
    list.innerHTML = "<li>Loading...</li>";

    try {
        const token = localStorage.getItem("authToken"); 
        const res = await fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Admin/my-notifications", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        list.innerHTML = "";

        if (data.length === 0) {
            list.innerHTML = "<li>No notifications</li>";
            return;
        }

        data.forEach(note => {
            const li = document.createElement("li");
            li.textContent = note.message;
            list.appendChild(li);
        });
    } catch (err) {
        list.innerHTML = "<li>No notifications</li>";
        console.error(err);
    }
}

function loadCalendar() {
    const calendarFrame = document.getElementById("calendarFrame");
    const connectBtn = document.getElementById("connectCalendarBtn");

    fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/calendar/my-calendar-id", {
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
    connectBtn.addEventListener("click", () => {
        window.location.href = "https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Auth/google-login";
    });
}
function addCourse(event) {
  // Prevent form/button default submission
  if (event) event.preventDefault();

  Swal.fire({
    title: 'Add New Course',
    input: 'text',
    inputLabel: 'Course Title',
    inputPlaceholder: 'Enter course title',
    showCancelButton: true,
    confirmButtonText: 'Save',
    cancelButtonText: 'Cancel',
    inputValidator: (value) => {
      if (!value.trim()) {
        return 'Please enter a course title!';
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const title = result.value.trim();

      fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Courses/add-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({ title })
      })
      .then(response => {
        if (!response.ok) throw new Error("Failed to add course");
        return response.json();
      })
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Course Added',
          text: 'The new course has been successfully created.',
          timer: 2000,
          showConfirmButton: false
        });
        setTimeout(() => {
        window.location.href = "/Courses/courses.html";
        }, 2000);
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not add course. Please try again.'
        });
      });
    }
  });
}
function loadRecentActivity() {
  fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Activity/recent", {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("authToken")}`
    }
  })
  .then(response => {
    if (!response.ok) throw new Error("Failed to load activity");
    return response.json();
  })
  .then(data => {
    const activityList = document.getElementById("activityList");
    activityList.innerHTML = "";

    if (!data.length) {
      activityList.innerHTML = "<li>No recent activity</li>";
      return;
    }

    data.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.message} (${new Date(item.date).toLocaleString()})`;
      activityList.appendChild(li);
    });
  })
  .catch(() => {
    // document.getElementById("activityList").innerHTML = "<li>Error loading activity</li>";
  });
}

// Add Course with SweetAlert
function addCourse(event) {
  if (event) event.preventDefault();

  Swal.fire({
    title: 'Add New Course',
    input: 'text',
    inputLabel: 'Course Title',
    inputPlaceholder: 'Enter course title',
    showCancelButton: true,
    confirmButtonText: 'Save',
    cancelButtonText: 'Cancel',
    inputValidator: (value) => {
      if (!value.trim()) {
        return 'Please enter a course title!';
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const title = result.value.trim();

      fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Courses/add-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({ title })
      })
      .then(response => {
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
          console.log('Response not ok, throwing error');
          throw new Error(`Failed to add course: ${response.status}`);
        }
        
        // Check if there's JSON content to parse
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return response.json();
        }
        
        // If no JSON content (like 204 No Content), return success indicator
        return { success: true };
      })
      .then(data => {
        console.log('Success! Data:', data);
        
        Swal.fire({
          icon: 'success',
          title: 'Course Added',
          text: 'The new course has been successfully created.',
          timer: 2000,
          showConfirmButton: false
        });
        
        // Add to recent activity instantly without refresh
        const activityList = document.getElementById("activityList");
        if (activityList) {
          const li = document.createElement("li");
          li.textContent = `Added new course: ${title} (${new Date().toLocaleString()})`;
          activityList.insertBefore(li, activityList.firstChild);
        }
        
        // Redirect after success message
        setTimeout(() => {
          window.location.href = "/Courses/courses.html";
        }, 2000);
      })
      .catch((error) => {
        console.error('Error adding course:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not add course. Please try again.'
        });
      });
    }
  });
}
function addTopic(event) {
  if (event) event.preventDefault();

  // Step 1: Load available courses first
  fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Courses/all-courses", {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("authToken")}`
    }
  })
  .then(response => {
    if (!response.ok) throw new Error("Failed to fetch courses");
    return response.json();
  })
  .then(result => {
    const courses = result.data || []; // ✅ Extract courses array

    if (!courses.length) {
      Swal.fire({
        icon: 'warning',
        title: 'No Courses Found',
        text: 'Please add a course before creating a topic.'
      });
      return;
    }

    // Step 2: Build course dropdown HTML
    const courseOptions = courses
      .map(c => `<option value="${c.id}">${c.title}</option>`)
      .join("");

    // Step 3: Show SweetAlert form
    Swal.fire({
      title: 'Add New Topic',
      html: `
        <label>Course:</label>
        <select id="swalCourse" class="swal2-input">${courseOptions}</select>
        
        <label>Topic Title:</label>
        <input id="swalTopicTitle" class="swal2-input" placeholder="Enter topic title">
        
        <label>Duration (hours):</label>
        <input id="swalDuration" type="number" min="1" class="swal2-input" placeholder="Enter duration">
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const courseId = document.getElementById("swalCourse").value;
        const courseTitle = document.getElementById("swalCourse").selectedOptions[0].text;
        const title = document.getElementById("swalTopicTitle").value.trim();
        const duration = document.getElementById("swalDuration").value.trim();

        if (!courseId || !title || !duration) {
          Swal.showValidationMessage("All fields are required");
          return false;
        }

        return { courseId, courseTitle, title, duration };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { courseId, courseTitle, title, duration } = result.value;

        // Step 4: Send to backend
        fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Topic", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`
          },
          body: JSON.stringify({
            courseId,
            title,
            duration
          })
        })
        .then(response => {
          if (!response.ok) throw new Error("Failed to add topic");
          return response.json();
        })
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Topic Added',
            text: 'The new topic has been successfully added.',
            timer: 2000,
            showConfirmButton: false
          });
          setTimeout(() => {
        window.location.href ="/Topics/topics.html";
        }, 2000);
          // Step 5: Add to Recent Activity instantly
          const activityList = document.getElementById("activityList");
          const li = document.createElement("li");
          li.textContent = `Added new topic: "${title}" to course "${courseTitle}" (${new Date().toLocaleString()})`;
          activityList.insertBefore(li, activityList.firstChild);
        })
        .catch(() => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Could not add topic. Please try again.'
          });
        });
      }
    });
  })
  .catch(() => {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to load courses from the server.'
    });
  });
}
function addBatch(event) {
  if (event) event.preventDefault();

  // Step 1: Fetch courses first
  fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Courses/all-courses", {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("authToken")}`
    }
  })
  .then(response => {
    if (!response.ok) throw new Error("Failed to fetch courses");
    return response.json();
  })
  .then(result => {
    const courses = result.data || [];

    if (!courses.length) {
      Swal.fire({
        icon: 'warning',
        title: 'No Courses Found',
        text: 'Please add a course before creating a batch.'
      });
      return;
    }

    // Step 2: Build dropdown for courses
    const courseOptions = courses
      .map(c => `<option value="${c.id}">${c.title}</option>`)
      .join("");

    // Step 3: Show SweetAlert form
    Swal.fire({
      title: 'Add New Batch',
      html: `
        <label>Batch Name:</label>
        <input id="swalBatchName" class="swal2-input" placeholder="Enter batch name">
        
        <label>Year:</label>
        <input id="swalBatchYear" type="number" min="2000" max="2100" class="swal2-input" placeholder="Enter year">
        
        <label>Course:</label>
        <select id="swalBatchCourse" class="swal2-input">${courseOptions}</select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const name = document.getElementById("swalBatchName").value.trim();
        const year = parseInt(document.getElementById("swalBatchYear").value); // ✅ Convert to in
        const courseId = document.getElementById("swalBatchCourse").value;
        const courseTitle = document.getElementById("swalBatchCourse").selectedOptions[0].text;
        if (!name || isNaN(year) || !courseId) {
          Swal.showValidationMessage("All fields are required and year must be valid");
          return false;
        }

        return { name, year, courseId, courseTitle };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { name, year, courseId, courseTitle } = result.value;
        const payload = {
        name,
        year: parseInt(year, 10),
        courseId
      };

        console.log("Sending to backend:", payload);
        // Step 4: Send to backend
        fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Batches/add-batch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`
          },
          body: JSON.stringify(payload)
          
        })
        .then(response => {
          if (!response.ok) throw new Error("Failed to add batch");
          return response.json();
        })
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Batch Added',
            text: `Batch "${name}" for course "${courseTitle}" (${year}) has been created.`,
            timer: 2000,
            showConfirmButton: false
          });
          setTimeout(() => {
        window.location.href = "/Batches/Batches.html";
        }, 2000);
          // Step 5: Add to Recent Activity instantly
          const activityList = document.getElementById("activityList");
          if (activityList) {
            const li = document.createElement("li");
            li.textContent = `Added batch "${name}" (${year}) to course "${courseTitle}" at ${new Date().toLocaleString()}`;
            activityList.insertBefore(li, activityList.firstChild);
          }
        })
        .catch(() => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Could not add batch. Please try again.'
          });
        });
      }
    });
  })
  .catch(() => {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to load courses from the server.'
    });
  });
}

function addInstructor(event) {
  if (event) event.preventDefault();

  Swal.fire({
    title: 'Add New Instructor',
    html: `
      <label>Name:</label>
      <input id="swalInstructorName" class="swal2-input" placeholder="Enter full name">

      <label>Email:</label>
      <input id="swalInstructorEmail" type="email" class="swal2-input" placeholder="Enter email address">

      <label>Phone:</label>
      <input id="swalInstructorPhone" type="tel" class="swal2-input" placeholder="Enter phone number">

      <label>Gender:</label>
      <select id="swalInstructorGender" class="swal2-input">
        <option value="">Select gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
    `,
    focusConfirm: false,
    showCancelButton: true,
    preConfirm: () => {
      const name = document.getElementById("swalInstructorName").value.trim();
      const email = document.getElementById("swalInstructorEmail").value.trim();
      const phoneNumber = document.getElementById("swalInstructorPhone").value.trim();
      const gender = document.getElementById("swalInstructorGender").value;

      if (!name || !email || !phoneNumber || !gender) {
        Swal.showValidationMessage("All fields are required");
        return false;
      }

      return { name, email, phoneNumber, gender };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const { name, email, phoneNumber, gender } = result.value;
      const payload = { name, email, phoneNumber, gender };

      console.log("Sending to backend:", payload);

      fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Instructors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(payload)
      })
      .then(response => {
        if (!response.ok) throw new Error("Failed to add instructor");
        return response.json();
      })
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Instructor Added',
          text: `Instructor "${name}" has been created successfully.`,
          timer: 2000,
          showConfirmButton: false
        });
         setTimeout(() => {
        window.location.href = "/Instructor/instructors.html";
        }, 2000);
        // Optional: Add to Recent Activity instantly
        const activityList = document.getElementById("activityList");
        if (activityList) {
          const li = document.createElement("li");
          li.textContent = `Added instructor "${name}" (${gender}) at ${new Date().toLocaleString()}`;
          activityList.insertBefore(li, activityList.firstChild);
        }
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not add instructor. Please try again.'
        });
      });
    }
  });
}

function generateSchedule(event) {
  if (event) event.preventDefault();

  // Fetch all batches
  fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Batches/all-batches", {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("authToken")}`
    }
  })
  .then(response => {
    if (!response.ok) throw new Error("Failed to fetch batches");
    return response.json();
  })
  .then(result => {
    const batches = result.data || [];

    if (!batches.length) {
      Swal.fire({
        icon: 'warning',
        title: 'No Batches Found',
        text: 'Please add a batch before generating a schedule.'
      });
      return;
    }

    // Build batch dropdown
    const batchOptions = batches
      .map(b => `<option value="${b.id}">${b.name} (${b.year})</option>`)
      .join("");

    // Ask only for batch
    Swal.fire({
      title: 'Generate Schedule',
      html: `
        <label>Batch:</label>
        <select id="swalScheduleBatch" class="swal2-input">${batchOptions}</select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const batchId = document.getElementById("swalScheduleBatch").value;

        if (!batchId) {
          Swal.showValidationMessage("Batch is required");
          return false;
        }

        return { batchId };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { batchId } = result.value;

        // console.log("Sending to backend:", { batchId });

        // Call backend with only batchId
        fetch(`https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Scheduler/schedule/${batchId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`
          },
          body: JSON.stringify({ batchId })
        })
        .then(response => {
          if (!response.ok) throw new Error("Failed to generate schedule");
          return response.json();
        })
        .then(response => {
          // Check if the response has the expected structure
          if (!response.status) {
            Swal.fire("Error", response.message || "Failed to generate schedule", "error");
            return;
          }

          const data = response.data;

          // Scheduled periods - same logic as before
          let scheduled = data.scheduledPeriods?.map(p => 
            `✅ ${p.topicTitle} (${p.instructorName}, ${new Date(p.startTime).toLocaleString()} - ${new Date(p.endTime).toLocaleString()})`
          ).join("<br>") || "None";

          // Unscheduled topics - handle objects properly
          let unscheduled = data.unscheduledTopics?.map(t => {
            // If t is an object, extract the title property (adjust property name as needed)
            if (typeof t === 'object' && t !== null) {
              return `❌ ${t.title || t.name || t.topicTitle || JSON.stringify(t)}`;
            }
            // If t is already a string, use it directly
            return `❌ ${t}`;
          }).join("<br>") || "None";

          // Show detailed results
          Swal.fire({
            icon: 'success',
            title: 'Schedule Generated Successfully',
            html: `
              <div style="text-align: left;">
                <strong>Scheduled Periods:</strong><br>${scheduled}<br><br>
                <strong>Unscheduled Topics:</strong><br>${unscheduled}
              </div>
            `,
            width: 700,
            showConfirmButton: true,
            confirmButtonText: 'OK'
          });
          // Optionally reload periods if you have this function
          if (typeof loadPeriods === 'function') {
            loadPeriods(batchId);
          }
        })
        .catch(error => {
          console.error('Schedule generation error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Could not generate schedule. Please try again.'
          });
        });
      }
    });
  })
  .catch(error => {
    console.error('Batch loading error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to load batches from the server.'
    });
  });
}


function loadUnassignedTopics() {
  fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Topic/unassigned-topics", {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("authToken")}`
    }
  })
  .then(response => {
    if (!response.ok) throw new Error("Failed to load unassigned topics");
    return response.json();
  })
  .then(result => {
    const listTopics = result.data || [];
    const topicList = document.getElementById("unassignedTopicList");
    topicList.innerHTML = "";

    if (!listTopics.length) {
      topicList.innerHTML = "<li>No unassigned topics found</li>";
      return;
    }

    listTopics.forEach(topic => {
      const li = document.createElement("li");
      li.style.marginBottom = "12px";          // Space between each topic
      li.style.display = "flex";
      li.style.alignItems = "center";
      li.style.justifyContent = "flex-start";  
      const span = document.createElement("span");
      span.textContent = `${topic.title} - ${topic.courseTitle || "No course"}`;

      // Create assign button
      const assignBtn = document.createElement("button");
      assignBtn.textContent = "Assign Instructor";
      assignBtn.style.marginLeft = "8px";     // Space between topic text and button
      assignBtn.style.backgroundColor = "#1e3a8a"; // sidebar blue color
      assignBtn.style.color = "white";
      assignBtn.style.border = "none";
      assignBtn.style.padding = "6px 12px";
      assignBtn.style.borderRadius = "6px";
      assignBtn.style.cursor = "pointer";
      assignBtn.style.fontSize = "0.9rem";

  // Optional: hover effect similar to sidebar links
      assignBtn.addEventListener("mouseenter", () => {
        assignBtn.style.backgroundColor = "#2563eb"; // lighter blue on hover
      });
      assignBtn.addEventListener("mouseleave", () => {
        assignBtn.style.backgroundColor = "#1e3a8a"; // original color on leave
      });
      assignBtn.addEventListener("click", () => openAssignInstructorModal(topic.id, topic.title));

      li.appendChild(span);
      li.appendChild(assignBtn);
      topicList.appendChild(li);
    });
  })
  .catch(() => {
    document.getElementById("unassignedTopicList").innerHTML = "<li>Error loading unassigned topics</li>";
  });
}

function openAssignInstructorModal(topicId, topicTitle) {
  // Fetch instructors for dropdown
  fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Instructors/instructors", {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("authToken")}`
    }
  })
  .then(response => {
    if (!response.ok) throw new Error("Failed to load instructors");
    return response.json();
  })
  .then(result => {
    const instructors = result.data || [];
    if (!instructors.length) {
      Swal.fire("No Instructors", "No instructors available to assign.", "warning");
      return;
    }

    // Build dropdown options
    const optionsHtml = instructors.map(i => `<option value="${i.id}">${i.name}</option>`).join("");
    Swal.fire({
      title: `Assign Instructor to: ${topicTitle}`,
      html: `
        <select id="swalInstructorSelect" class="swal2-select">
          ${optionsHtml}
        </select>
      `,
      preConfirm: () => {
        const selectedId = Swal.getPopup().querySelector("#swalInstructorSelect").value;
        if (!selectedId) {
          Swal.showValidationMessage("Please select an instructor");
          return false;
        }
        return selectedId;
      },
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        const instructorId = result.value;
        console.log(topicId);
        assignInstructorToTopic(topicId, instructorId);
      }
    });
  })
  .catch(() => {
    Swal.fire("Error", "Failed to load instructors", "error");
  });
}

function assignInstructorToTopic(topicId, instructorId) {
  fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Topic/assign-instructors", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    //  const auth = "Authorization": `Bearer ${localStorage.getItem("authToken")}`
    },
    body: JSON.stringify({
      topicId: topicId,
      instructorIds: [instructorId]
    })
  })
  .then(response => {
    if (!response.ok) throw new Error("Failed to assign instructor");
    return response.json();
  })
  .then(() => {
    Swal.fire("Success", "Instructor assigned successfully", "success");
    // Refresh the unassigned topic list to reflect changes
    loadUnassignedTopics();
    setTimeout(() => {
        window.location.href = "/Instructor/qualified-topics.html";
        }, 2000);
  })
  
  .catch(() => {
    Swal.fire("Error", "Failed to assign instructor", "error");
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

// Load data on page load
// document.addEventListener("DOMContentLoaded", () => {
  
// });
