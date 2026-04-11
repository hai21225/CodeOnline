// ======== SESSION TIMEOUT (Giữ nguyên) ========
let inactivityTime = 0;
const maxInactivity = 5 * 60 * 1000; // 5 phút

function resetTimer() {
    inactivityTime = 0;
}

window.onload = () => {
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;

    setInterval(() => {
        inactivityTime += 1000;
        if (inactivityTime >= maxInactivity) {
            alert("⏰ Hết phiên làm việc do không hoạt động!");
            localStorage.removeItem("token");
            window.location.href = "Login.html";
        }
    }, 1000);

    checkAccess();
};

// ======== ACCESS CONTROL (Giữ nguyên) ========
function checkAccess() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || (role !== "Lecturer" && role !== "Admin")) {
        alert("Bạn không có quyền truy cập!");
        window.location.href = "Login.html";
    }
}


// ======== MỞ TRANG FEEDBACK (Giữ nguyên) ========
function openFeedback(studentId) {
    localStorage.setItem("selectedStudentId", studentId);
    localStorage.setItem("studentId", studentId);
    window.location.href = "Feedback.html";
}

// --- Xử lý dropdown người dùng (SỬA LỖI: Thêm kiểm tra Null tại đây) ---
const userBtn = document.getElementById("userBtn");
const userDropdown = document.getElementById("userDropdown");

// Chỉ gán sự kiện nếu element tồn tại trên trang hiện tại
if (userBtn && userDropdown) {
    userBtn.addEventListener("click", () => {
        userDropdown.style.display =
            userDropdown.style.display === "block" ? "none" : "block";
    });

    window.addEventListener("click", (e) => {
        if (!userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.style.display = "none";
        }
    });
}

// Nút đăng xuất (Kiểm tra ID trước khi gán)
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.onclick = () => {
        if (confirm("Bạn có chắc muốn đăng xuất không?")) {
            localStorage.clear();
            window.location.href = "Login.html";
        }
    };
}

// Các nút chuyển trang khác (Kiểm tra ID trước khi gán)
const viewProfile = document.getElementById("viewProfile");
if (viewProfile) {
    viewProfile.onclick = () => { window.location.href = "Profile.html"; };
}

const changePassword = document.getElementById("changePassword");
if (changePassword) {
    changePassword.onclick = () => { window.location.href = "ChangePassword.html"; };
}

// Xuất hàm logout ra global để hỗ trợ các nút dùng onclick="logout()" trực tiếp
window.logout = () => {
    if (confirm("Bạn có chắc muốn đăng xuất không?")) {
        localStorage.clear();
        window.location.href = "Login.html";
    }
};