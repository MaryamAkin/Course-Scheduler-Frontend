document.addEventListener("DOMContentLoaded", () => {
    // 🌐 Define API endpoints here so you can edit them easily
    // const API_BASE_URL = "https://your-backend-api.com"; 
    const BATCHES_ENDPOINT = `course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Batches/all-batches`;
    const CREATE_ACCOUNT_ENDPOINT = `course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Students`;

    const batchSelect = document.getElementById("batchSelect");

    // 📥 Fetch batches from API and populate the dropdown
    fetch(BATCHES_ENDPOINT)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch batches: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            const batches = data.data || [];
            batchSelect.innerHTML = ""; // Clear loading text
            if (batches.length > 0) {
                batches.forEach((batch) => {
                    const option = document.createElement("option");
                    option.value = batch.id; 
                    option.textContent = batch.name; 
                    batchSelect.appendChild(option);
                });
            } else {
                batchSelect.innerHTML = '<option value="">No batches available</option>';
            }
        })
        .catch((error) => {
            console.error("Error loading batches:", error);
            batchSelect.innerHTML = '<option value="">Error loading batches</option>';
        });

    // 📤 Handle create account form submission
    const createAccountForm = document.getElementById("createAccountForm");

    createAccountForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(createAccountForm);

        try {
            const response = await fetch(CREATE_ACCOUNT_ENDPOINT, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                alert("✅ Account created successfully! Redirecting to Sign In...");
                window.location.href = "/Sign/sign.html"; // Redirect to login page
            } else {
                const errorData = await response.json();
                alert(`❌ Error: ${errorData.message || "Could not create account"}`);
            }
        } catch (err) {
            console.error("Network or server error:", err);
            alert("❌ An unexpected error occurred. Please try again later.");
        }
    });
});
