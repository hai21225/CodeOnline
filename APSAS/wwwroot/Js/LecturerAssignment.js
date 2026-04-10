const baseUrl = "http://localhost:5261";
let selectedAssignmentId = null;
const token = localStorage.getItem("token");

async function fetchWithToken(url, options = {}) {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
        "Authorization": `Bearer ${token}`
    };
    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        localStorage.clear();
        window.location.href = "/Login.html";
        return;
    }
    return res;
}

async function loadAssignments() {
    try {
        const res = await fetchWithToken(`${baseUrl}/GetAllAssignment`);
        if (!res || !res.ok) return;
        const data = await res.json();

        const container = document.getElementById("assignmentContainer");
        // FIX LỖI: Nếu trang không có chỗ hiển thị bài tập thì thoát hàm luôn
        if (!container) return;

        container.innerHTML = "";

        data.forEach(a => {
            const card = document.createElement("div");
            card.className = "assignment-card";
            card.innerHTML = `<h3>${a.title}</h3>`;
            card.onclick = () => openModal(a);
            container.appendChild(card);
        });
    } catch (err) {
        console.error("Lỗi khi tải danh sách bài tập:", err);
    }
}

// Gọi hàm load khi file được tải
if (document.getElementById("assignmentContainer")) {
    loadAssignments();
}

/* --- Các nút Modal (Thêm Null Check để an toàn) --- */

const addAssignBtn = document.getElementById("addAssignmentBtn");
if (addAssignBtn) {
    addAssignBtn.onclick = () => {
        const modal = document.getElementById("addAssignmentModal");
        if (modal) modal.style.display = "flex";
    };
}

// ... (Các logic xử lý Modal khác của bạn giữ nguyên, nhưng nên bọc trong if nếu dùng chung file JS)

// Sửa logic trong viewTestcaseBtn để tránh lỗi innerHTML
const viewTestBtn = document.getElementById("viewTestcaseBtn");
if (viewTestBtn) {
    viewTestBtn.onclick = async () => {
        if (!selectedAssignmentId) return;
        try {
            const res = await fetchWithToken(`${baseUrl}/GetTestCaseById/${selectedAssignmentId}`);
            const data = await res.json();
            const container = document.querySelector("#viewTestCaseModal .modal-content");

            if (!container) return; // FIX LỖI TẠI ĐÂY

            const oldCases = container.querySelectorAll(".testcase-item");
            oldCases.forEach(e => e.remove());

            // ... (Tiếp tục logic của bạn)
            document.getElementById("viewTestCaseModal").style.display = "flex";
        } catch (err) { console.error(err); }
    };
}

// Tương tự cho viewResourceBtn
const viewResBtn = document.getElementById("viewResourceBtn");
if (viewResBtn) {
    viewResBtn.onclick = async () => {
        if (!selectedAssignmentId) return;
        try {
            const res = await fetchWithToken(`${baseUrl}/GetResourceById/${selectedAssignmentId}`);
            const data = await res.json();
            const container = document.querySelector("#viewResourceModal .modal-content");

            if (!container) return; // FIX LỖI TẠI ĐÂY

            const oldResources = container.querySelectorAll(".resource-item");
            oldResources.forEach(e => e.remove());

            // ... (Tiếp tục logic của bạn)
            document.getElementById("viewResourceModal").style.display = "flex";
        } catch (err) { console.warn(err); }
    };
}

/* Các logic onclick khác bạn hãy bọc trong 'if (element)' tương tự để file JS này không bao giờ báo lỗi nữa. */