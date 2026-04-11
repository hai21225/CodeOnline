//const gatewayUrl = "http://localhost:5261";
const gatewayUrl = "http://52.184.80.181:5261";
const changePwdEndpoint = "/ChangePassword";
const token = localStorage.getItem("token");
const username = localStorage.getItem("username");
const role = localStorage.getItem("role");

const msg = document.getElementById("pwdMsg");

if (!token || !username || !role) {
    alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
    window.location.href = "Login.html";
}

// 🟩 Gửi request đổi mật khẩu
document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const current = document.getElementById("currentPassword").value.trim();
    const newPwd = document.getElementById("newPassword").value.trim();
    const confirm = document.getElementById("confirmPassword").value.trim();

    msg.textContent = "";
    msg.style.color = "#c0392b";

    if (!current || !newPwd || !confirm)
        return msg.textContent = "⚠️ Vui lòng nhập đầy đủ thông tin.";

    if (newPwd !== confirm)
        return msg.textContent = "❌ Mật khẩu xác nhận không khớp.";

    try {
        const res = await fetch(gatewayUrl + changePwdEndpoint, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Username: username,
                OldPassword: current,
                NewPassword: newPwd
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Không thể đổi mật khẩu.");

        msg.style.color = "#27ae60";
        msg.textContent = "✅ Đổi mật khẩu thành công!";

        setTimeout(() => {
            switch (role) {
                case "Admin":
                    window.location.href = "Adminpage.html";
                    break;
                case "Lecturer":
                    window.location.href = "DashboardLecturer.html";
                    break;
                case "Student":
                    window.location.href = "StudentDashboard.html";
                    break;
                default:
                    window.location.href = "Login.html";
            }
        }, 1500);
    } catch (err) {
        msg.style.color = "#c0392b";
        msg.textContent = err.message;
    }
});

// 🟨 Quay lại đúng trang theo role
document.getElementById("backBtn").addEventListener("click", (e) => {
    e.preventDefault();
    switch (role) {
        case "Admin": window.location.href = "Adminpage.html"; break;
        case "Lecturer": window.location.href = "DashboardLecturer.html"; break;
        case "Student": window.location.href = "StudentDashboard.html"; break;
        default: window.location.href = "Login.html";
    }
});
