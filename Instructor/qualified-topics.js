const instructorId = new URLSearchParams(window.location.search).get("instructorId");
const topicsTableBody = document.querySelector("#topicsTable tbody");

if (!instructorId) {
    Swal.fire("Error", "Instructor ID is missing from the URL.", "error");
}

async function loadQualifiedTopics() {
    try {
        const res = await fetch(`https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Topic/assigned-toinstructors/${instructorId}`);
        const result = await res.json();

        topicsTableBody.innerHTML = "";
        const topics = result.data || [];
        if (topics.length == 0) {
            topicsTableBody.innerHTML = "<tr><td colspan='2'>No qualified topics found.</td></tr>";
            return;
        }

        topics.forEach(topic => {
            const row = `
                <tr>
                    <td>${topic.topicTitle}</td>
                    <td>${topic.courseTitle}</td>
                </tr>
            `;
            topicsTableBody.innerHTML += row;
        });

    } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load qualified topics.", "error");
    }
}

async function openAssignModal() {
    try {
        // Fetch all topics
        const topicsRes = await fetch(`https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Topic/all-topics`);
        const topicsData = await topicsRes.json();
        const topics = topicsData.data || [];
        // Fetch instructor's current qualified topics
        const qualifiedRes = await fetch(`https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Topic/assigned-toinstructors/${instructorId}`);
        const qualifiedData = await qualifiedRes.json();
        const result = qualifiedData.data || [];
        const qualifiedIds = result.map(t => t.id);
        let checkboxesHTML = topics.map(topic => {
            const isQualified = qualifiedIds.includes(topic.id);
            return `
                <label style="display:block;margin-bottom:5px;">
                    <input type="checkbox" value="${topic.id}" ${isQualified ? "checked disabled" : ""}>
                    ${topic.title} (${topic.courseTitle})
                </label>
            `;
        }).join("");

        const { value: selected } = await Swal.fire({
            title: "Assign Topics",
            html: `<div style="text-align:left;max-height:300px;overflow-y:auto;">${checkboxesHTML}</div>`,
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                return Array.from(document.querySelectorAll("input[type=checkbox]:not(:disabled):checked"))
                    .map(cb => cb.value);
            }
        });

        if (selected && selected.length > 0) {
            await fetch(`https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Topic/assign-topic`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ instructorId, topicIds: selected })
            });

            Swal.fire("Success", "Topics assigned successfully!", "success");
            loadQualifiedTopics();
        }

    } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load topics for assignment.", "error");
    }
}

document.getElementById("assignBtn").addEventListener("click", openAssignModal);

loadQualifiedTopics();
