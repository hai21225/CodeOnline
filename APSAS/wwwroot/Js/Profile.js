//const gatewayUrl = "http://localhost:5261";
const gatewayUrl = "http://52.184.80.181:5261";
const getUserEndpoint = "/GetUserByUsername";

// Lấy token & username từ localStorage
const token = localStorage.getItem("token");
const username = localStorage.getItem("username");
const role = localStorage.getItem("role");

if (!token || !username) {
    alert("Vui lòng đăng nhập lại!");
    window.location.href = "Login.html";
}

const $ = id => document.getElementById(id);

async function loadProfile() {
    try {
        const res = await fetch(`${gatewayUrl}${getUserEndpoint}?username=${username}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error("Không thể tải thông tin người dùng.");

        const data = await res.json();
        $("profileInfo").innerHTML = `
            <p><span class="label">Tên đăng nhập:</span> ${data.username}</p>
            <p><span class="label">Họ và tên:</span> ${data.fullName || "(Chưa có)"}</p>
            <p><span class="label">Email:</span> ${data.email || "(Chưa có)"}</p>
            <p><span class="label">Vai trò:</span> ${data.roleName || role}</p>
        `;
    } catch (err) {
        $("profileMsg").textContent = err.message;
    }
}

loadProfile();

$("btnBack").addEventListener("click", () => {
    if (role === "Student") {
        window.location.href = "StudentDashboard.html";
    } else if (role === "Lecturer") {
        window.location.href = "DashboardLecturer.html";
    } else if (role === "Admin") {
        window.location.href = "Adminpage.html";
    } else {
        alert("Không xác định được vai trò. Vui lòng đăng nhập lại.");
        window.location.href = "Login.html";
    }
});
