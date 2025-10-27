document.addEventListener("DOMContentLoaded", () => {
    const instructorId = new URLSearchParams(window.location.search).get("id");

    if (!instructorId) {
        Swal.fire("Error", "Instructor ID is missing in the URL.", "error");
        return;
    }
    console.log(instructorId);
    fetch(`https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Instructors/profile/${instructorId}`)
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch instructor details");
            return res.json();
        })
        .then(result => {
            const profile = result.data || [];
            document.getElementById("instructorName").textContent = profile.name;
            document.getElementById("instructorEmail").textContent = profile.email;
            document.getElementById("instructorGender").textContent = profile.gender;
            document.getElementById("instructorPhone").textContent = profile.phoneNumber;
            document.getElementById("instructorImage").src = profile.profileImagePath || "https://placehold.co/150x150";
            document.getElementById("availabilityLink").href = `/Instructor/instructor-availability.html?id=${instructorId}`;
        })
        .catch(err => {
            console.error(err);
            Swal.fire("Error", "Unable to load instructor details.", "error");
        });
});
    
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
