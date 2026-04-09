const GATEWAY_URL = "http://localhost:5261";
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

// ========== API CONFIG ==========
function toggleApiForm(mode) {
    document.getElementById("addApiForm").style.display = mode === 'add' ? 'block' : 'none';
    document.getElementById("updateApiForm").style.display = mode === 'update' ? 'block' : 'none';
    document.getElementById("apiListContainer").style.display = mode === 'list' ? 'block' : 'none';
    if (mode === 'list') loadAPIList();
}

async function addAPIConfig() {
    const name = document.getElementById("apiName").value.trim();
    const baseUrl = document.getElementById("baseUrl").value.trim();
    const msg = document.getElementById("apiMessage");
    if (!name || !baseUrl) {
        msg.textContent = "⚠️ Vui lòng nhập đủ thông tin";
        msg.className = "message error";
        return;
    }
    try {
        const res = await secureFetch(`${GATEWAY_URL}/AddAPI`, {
            method: "POST",
            body: JSON.stringify({ name, baseUrl })
        });
        if (!res.ok) throw new Error("Thêm API thất bại");
        msg.textContent = "✅ Thêm API thành công";
        msg.className = "message success";
        document.getElementById("apiName").value = "";
        document.getElementById("baseUrl").value = "";
    } catch (err) {
        msg.textContent = "🚫 " + err.message;
        msg.className = "message error";
    }
}

async function updateAPIConfig() {
    const id = document.getElementById("apiId").value.trim();
    const name = document.getElementById("apiNameUpdate").value.trim();
    const baseUrl = document.getElementById("baseUrlUpdate").value.trim();
    const msg = document.getElementById("apiUpdateMessage");
    if (!id || !name || !baseUrl) {
        msg.textContent = "⚠️ Vui lòng nhập đủ thông tin";
        msg.className = "message error";
        return;
    }
    try {
        const res = await secureFetch(`${GATEWAY_URL}/UpdateAPI/${id}`, {
            method: "PUT",
            body: JSON.stringify({ name, baseUrl })
        });
        if (!res.ok) throw new Error("Cập nhật API thất bại");
        msg.textContent = "✅ Cập nhật API thành công";
        msg.className = "message success";
    } catch (err) {
        msg.textContent = "🚫 " + err.message;
        msg.className = "message error";
    }
}

async function loadAPIList() {
    const container = document.getElementById("apiListContent");
    container.innerHTML = "<p>⏳ Đang tải API...</p>";
    try {
        const res = await secureFetch(`${GATEWAY_URL}/GetAllAPI`);
        if (!res.ok) throw new Error("Không thể tải API");
        const apis = await res.json();
        if (!apis.length) {
            container.innerHTML = "<p>Không có API nào.</p>";
            return;
        }
        let html = "<table><tr><th>ID</th><th>Tên API</th><th>Base URL</th></tr>";
        apis.forEach(api => {
            html += `<tr><td>${api.apiID}</td><td>${api.name}</td><td>${api.baseURL}</td></tr>`;
        });
        html += "</table>";
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = `<p style="color:red;">🚫 ${err.message}</p>`;
    }
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


// ========== LANGUAGE MANAGEMENT ==========

// Load danh sách ngôn ngữ
let langListLoaded = false;

document.getElementById("toggleLangBtn").addEventListener("click", async () => {
    const container = document.getElementById("langListContainer");
    const btn = document.getElementById("toggleLangBtn");

    if (container.style.display === "none") {
        container.style.display = "block";
        btn.textContent = "Ẩn danh sách";
        if (!langListLoaded) {
            await loadLanguages();
            langListLoaded = true;
        }
    } else {
        container.style.display = "none";
        btn.textContent = "Xem danh sách";
    }
});

// Load danh sách ngôn ngữ
async function loadLanguages() {
    const container = document.getElementById("langListContent");
    container.innerHTML = "<p>⏳ Đang tải danh sách ngôn ngữ...</p>";

    try {
        const res = await secureFetch(`${GATEWAY_URL}/get-languages`);
        if (!res.ok) throw new Error("Không thể tải danh sách ngôn ngữ");
        const langs = await res.json();

        if (!langs.length) {
            container.innerHTML = "<p>Chưa có ngôn ngữ nào.</p>";
            return;
        }

        let html = "<table><tr><th>ID</th><th>Tên</th><th>Hành động</th></tr>";
        langs.forEach(l => {
            html += `<tr>
                        <td>${l.languageId}</td>
                        <td>${l.languageName}</td>
                        <td>
                            <button class='btn-edit' onclick='editLanguage(${l.languageId}, "${l.languageName}")'>Sửa</button>
                            <button class='btn-delete' onclick='deleteLanguage(${l.languageId})'>Xóa</button>
                        </td>
                    </tr>`;
        });
        html += "</table>";
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = `<p style='color:red;'>🚫 ${err.message}</p>`;
    }
}

// Thêm Language
async function addLanguage() {
    const id = parseInt(document.getElementById("langId").value);
    const name = document.getElementById("langName").value.trim();
    const msg = document.getElementById("langMessage");

    if (!id || !name) {
        msg.textContent = "⚠️ Vui lòng nhập ID và tên ngôn ngữ";
        msg.className = "message error";
        return;
    }

    try {
        const res = await secureFetch(`${GATEWAY_URL}/add-language`, {
            method: "POST",
            body: JSON.stringify({ LanguageId: id, LanguageName: name })
        });
        if (!res.ok) throw new Error("Thêm ngôn ngữ thất bại");
        msg.textContent = "✅ Thêm ngôn ngữ thành công!";
        msg.className = "message success";
        document.getElementById("langId").value = "";
        document.getElementById("langName").value = "";
        if (langListLoaded) loadLanguages();
    } catch (err) {
        msg.textContent = "🚫 " + err.message;
        msg.className = "message error";
    }
}

// Sửa Language
function editLanguage(id, name) {
    const newName = prompt("Tên mới:", name);
    if (!newName) return;
    updateLanguage(id, newName);
}

async function updateLanguage(id, name) {
    try {
        const res = await secureFetch(`${GATEWAY_URL}/update-language`, {
            method: "PUT",
            body: JSON.stringify({ LanguageId: id, LanguageName: name })
        });
        if (!res.ok) throw new Error("Cập nhật thất bại");
        if (langListLoaded) loadLanguages();
    } catch (err) {
        alert("🚫 " + err.message);
    }
}

// Xóa Language
async function deleteLanguage(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa ngôn ngữ này?")) return;
    try {
        const res = await secureFetch(`${GATEWAY_URL}/delete-language/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Xóa thất bại");
        if (langListLoaded) loadLanguages();
    } catch (err) {
        alert("🚫 " + err.message);
    }
}





window.onload = () => {
    toggleApiForm('add');
    loadUsers();
};


// ========== ADMIN CHAT (SIGNALR) ==========

// Chờ DOM load xong mới chạy chat
document.addEventListener("DOMContentLoaded", () => {
    // ... (code load user, v.v. nếu có) ...

    // Khởi tạo Chat
    setupAdminChat();
});

// Lấy các element
const chatBox = document.getElementById("studentMessages");

// 1. Kết nối tới Hub của AdminService
const hubConnection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5140/chathub") // URL thật của AdminService
    .withAutomaticReconnect()
    .build();

// 2. Hàm thêm tin nhắn vào UI
function appendAdminChatMessage(message, sender) {
    // Xóa tin "Đang tải..." nếu là tin đầu tiên
    if (chatBox.querySelector("p")?.textContent.startsWith("⏳")) {
        chatBox.innerHTML = "";
    }

    const isScrolledToBottom = chatBox.scrollHeight - chatBox.clientHeight <= chatBox.scrollTop + 1;

    const p = document.createElement("p");
    // Dùng innerHTML để render thẻ strong
    p.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatBox.appendChild(p);

    // Tự cuộn xuống dưới
    if (isScrolledToBottom) {
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// 3. Hàm setup chính
async function setupAdminChat() {

    // *** ĐÂY LÀ PHẦN QUAN TRỌNG NHẤT BẠN ĐANG THIẾU ***
    // Lắng nghe tín hiệu "ReceiveMessage" mà C# đang gửi
    hubConnection.on("ReceiveMessage", (user, message) => {
        // user ở đây sẽ là "student" (hoặc "user" tùy bạn đặt trong ChatSv.cs)
        appendAdminChatMessage(message, user);
    });

    // 4. Bắt đầu kết nối
    try {
        await hubConnection.start();
        chatBox.innerHTML = ""; // Xóa "Connecting..."
        appendAdminChatMessage("✅ Đã kết nối tới chat server.", "System");
    } catch (err) {
        console.error(err);
        chatBox.innerHTML = "<p>❌ Không thể kết nối chat.</p>";
    }
}