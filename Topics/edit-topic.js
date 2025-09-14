document.addEventListener("DOMContentLoaded", () => {
  const topicId = new URLSearchParams(window.location.search).get("topicId");
  if (!topicId) {
    Swal.fire("Error", "Missing topic ID in URL.", "error");
    return;
  }

  fetchCourses();
  fetchTopicDetails(topicId);

  document.getElementById("editTopicForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    await updateTopic(topicId);
  });
});

async function fetchCourses() {
  try {
    const res = await fetch("https://localhost:7295/api/Courses/all-courses");
    const result = await res.json();
    const courses = result.data || [];
    const courseSelect = document.getElementById("courseSelect");
    courseSelect.innerHTML = courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('');
  } catch (err) {
    console.error("Error loading courses:", err);
    Swal.fire("Error", "Failed to load courses.", "error");
  }
}

async function fetchTopicDetails(topicId) {
  try {
    const res = await fetch(`https://localhost:7295/api/Topic/${topicId}`);
    if (!res.ok) throw new Error("Topic not found");
    const topic = await res.json();
    const result = topic.data || [];
    document.getElementById("title").value = result.title;
    document.getElementById("duration").value = result.durationHours;
    document.getElementById("courseSelect").value = result.courseId;
  } catch (err) {
    console.error("Error loading topic:", err);
    Swal.fire("Error", "Failed to load topic details.", "error");
  }
}

async function updateTopic(topicId) {
  const title = document.getElementById("title").value.trim();
  const duration = parseInt(document.getElementById("duration").value, 10);
  const courseId = document.getElementById("courseSelect").value;

  if (!title || !duration || !courseId) {
    Swal.fire("Warning", "All fields are required.", "warning");
    return;
  }

  try {
    const res = await fetch(`https://localhost:7295/api/Topic/${topicId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, duration, courseId })
    });

    if (res.ok) {
      Swal.fire("Success", "Topic updated successfully.", "success").then(() => {
        window.location.href = "/Topics/topics.html";
      });
    } else {
      Swal.fire("Error", "Failed to update topic.", "error");
    }
  } catch (err) {
    console.error("Error updating topic:", err);
    Swal.fire("Error", "An error occurred while updating.", "error");
  }
}
