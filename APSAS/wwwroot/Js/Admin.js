//const GATEWAY_URL = "http://localhost:5261";
const GATEWAY_URL = "http://52.184.80.181:5261";
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
window._usersMap = {};

// Phân quyền JWT
if (!token || role !== "Admin") {
    alert("🚫 Bạn không có quyền truy cập!");
    localStorage.clear();
    window.location.href = "Login.html";
}

async function secureFetch(url, options = {}) {
    options.headers = {
        ...(options.headers || {}),
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
    return await fetch(url, options);
}

function logout() {
    localStorage.clear();
    window.location.href = "Login.html";
}



// ========== USERS ==========
document.getElementById("submitUserBtn").addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const fullname = document.getElementById("fullname").value.trim();
    const password = document.getElementById("password").value.trim();
    const roleid = parseInt(document.getElementById("roleid").value);
    const msg = document.getElementById("userMessage");

    if (!username || !email || !password) {
        msg.textContent = "⚠️ Vui lòng nhập đủ thông tin!";
        msg.className = "message error";
        return;
    }

    try {
        const res = await secureFetch(`${GATEWAY_URL}/AddUser`, {
            method: "POST",
            body: JSON.stringify({
                username, email, fullName: fullname,
                passwordHash: password, roleID: roleid
            })
        });
        if (!res.ok) throw new Error("Thêm user thất bại");
        msg.textContent = "✅ Thêm người dùng thành công!";
        msg.className = "message success";
        document.getElementById("username").value = "";
        document.getElementById("email").value = "";
        document.getElementById("fullname").value = "";
        document.getElementById("password").value = "";
        loadUsers();
    } catch (err) {
        msg.textContent = "🚫 " + err.message;
        msg.className = "message error";
    }
});

async function loadUsers() {
    const container = document.getElementById("userTableContainer");
    container.innerHTML = "<p>⏳ Đang tải danh sách người dùng...</p>";
    window._usersMap = {};
    try {
        const res = await secureFetch(`${GATEWAY_URL}/GetAllUsers`);
        if (!res.ok) throw new Error("Không thể tải người dùng");
        const users = await res.json();
        users.forEach(u => { window._usersMap[u.userID] = u; });
        let html = "<table><tr><th>ID</th><th>Username</th><th>Email</th><th>Full Name</th><th>Role</th><th>Actions</th></tr>";
        users.forEach(u => {
            html += `<tr>
                        <td>${u.userID}</td>
                        <td>${u.username}</td>
                        <td>${u.email || ''}</td>
                        <td>${u.fullName || ''}</td>
                        <td>${u.roleName || u.roleID || ''}</td>
                        <td>
                            <button class="btn-edit" onclick="openEditModal(${u.userID})">Sửa</button>
                            <button class="btn-delete" onclick="deleteUser(${u.userID})">Xóa</button>
                        </td>
                    </tr>`;
        });
        html += "</table>";
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = `<p style="color:red;">🚫 ${err.message}</p>`;
    }
}

function openEditModal(userId) {
    const user = window._usersMap[userId];
    if (!user) { alert("Không tìm thấy user."); return; }
    document.getElementById("editUserId").value = user.userID;
    document.getElementById("editUsername").value = user.username || "";
    document.getElementById("editEmail").value = user.email || "";
    document.getElementById("editFullname").value = user.fullName || "";
    document.getElementById("editPassword").value = "";
    document.getElementById("editRole").value = user.roleID || 3;
    document.getElementById("editMessage").textContent = "";
    document.getElementById("editOverlay").style.display = "flex";
}

function closeEditModal() {
    document.getElementById("editOverlay").style.display = "none";
}

async function confirmUpdateUser() {
    const id = parseInt(document.getElementById("editUserId").value);
    const username = document.getElementById("editUsername").value.trim();
    const email = document.getElementById("editEmail").value.trim();
    const fullName = document.getElementById("editFullname").value.trim();
    const password = document.getElementById("editPassword").value.trim();
    const roleID = parseInt(document.getElementById("editRole").value);
    const msg = document.getElementById("editMessage");

    if (!username || !email) {
        msg.textContent = "⚠️ Username và Email không được để trống.";
        msg.className = "message error";
        return;
    }

    const payload = { userID: id, username, email, fullName, roleID };
    if (password) payload.passwordHash = password;

    try {
        const res = await secureFetch(`${GATEWAY_URL}/UpdateUser`, {
            method: "PUT",
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Cập nhật user thất bại");
        msg.textContent = "✅ Cập nhật thành công";
        msg.className = "message success";
        loadUsers();
        setTimeout(closeEditModal, 1000);
    } catch (err) {
        msg.textContent = "🚫 " + err.message;
        msg.className = "message error";
    }
}

async function deleteUser(userId) {
    if (!confirm("Bạn chắc chắn muốn xóa người dùng này?")) return;
    try {
        const res = await secureFetch(`${GATEWAY_URL}/DeleteUser/${userId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Xóa thất bại");
        loadUsers();
    } catch (err) {
        alert("🚫 " + err.message);
    }
}

function confirmDeleteFromModal() {
    const id = parseInt(document.getElementById("editUserId").value);
    deleteUser(id);
    closeEditModal();
}

window.onload = () => {
    // toggleApiForm('add'); ❌ bỏ đi
    loadUsers();
    document.getElementById("editOverlay").style.display = "none";
};