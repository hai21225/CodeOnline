//const gatewayUrl = "http://localhost:5261";
const gatewayUrl = "http://52.184.80.181:5261";
const loginEndpoint = "/Login";

const $ = id => document.getElementById(id);
const showMessage = (el, text) => el.textContent = text;

// ==== LOGIN ====
$("loginBtn").addEventListener("click", async (e) => {
    e.preventDefault();
    const username = $("username").value.trim();
    const password = $("password").value;
    const msg = $("loginMsg");

    if (!username || !password)
        return showMessage(msg, "⚠️ Vui lòng nhập username và mật khẩu.");

    $("loginBtn").disabled = true;
    $("loginBtn").textContent = "Đang đăng nhập...";

    try {
        const res = await fetch(gatewayUrl + loginEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Sai thông tin đăng nhập.");

        // ✅ Lưu thông tin
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.roleName);
        localStorage.setItem("username", data.username);

        // ✅ Điều hướng theo role
        setTimeout(() => {
            switch (data.roleName) {
                case "Admin": window.location.href = "Adminpage.html"; break;
                case "Lecturer": window.location.href = "DashboardLecturer.html"; break;
                case "Student": window.location.href = "StudentDashboard.html"; break;
                default:
                    localStorage.clear();
                    showMessage(msg, "❌ Tài khoản không được phép truy cập.");
            }
        }, 300);
    } catch (err) {
        showMessage(msg, err.message);
    } finally {
        $("loginBtn").disabled = false;
        $("loginBtn").textContent = "Đăng nhập";
    }
});

// ==== Nút hỗ trợ ====
$("supportBtn").addEventListener("click", () => {
    window.location.href = "Supportpage.html"; // chuyển sang trang hỗ trợ
});
