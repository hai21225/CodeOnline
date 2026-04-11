const gatewayUrl = "http://localhost:5261"; // API Gateway URL
const gatewayUrl = "http://52.184.80.181:5261";
let selectedLanguageId = 71; // mặc định Python
let testcaseExample = " ";
const token = localStorage.getItem("token");
const assignmentId = localStorage.getItem("currentAssignmentId");


async function fetchWithToken(url, options = {}) {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
        "Authorization": `Bearer ${token}`
    };
    const res = await fetch(url, { ...options, headers });

    // ✅ Nếu token hết hạn hoặc không hợp lệ
    if (res.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        localStorage.clear(); // xoá token + info user
        window.location.href = "/Login.html"; // redirect về login
        return; // dừng tiếp
    }
    return res;
}

// 🟢 Load assignment
async function loadAssignment() {
    if (!assignmentId) {
        document.getElementById("assignmentTitle").innerText = "❌ Không tìm thấy ID bài tập!";
        return;
    }
    try {
        const res = await fetchWithToken(`${gatewayUrl}/GetAssignmentById/${assignmentId}`);
        if (!res.ok) throw new Error("Không tải được bài tập");
        const data = await res.json();

        document.getElementById("assignmentId").value = data.assignmentId;
        document.getElementById("assignmentTitle").innerText = ` ${data.title}`;
        document.getElementById("assignmentDescription").innerText = data.description || "Không có mô tả.";
        document.getElementById("assignmentSampleTestCase").innerText = data.sampleTestCase || "khoong co testcase";
        testcaseExample = data.sampleTestCase;
        document.getElementById("assignmentDifficulty").innerText = data.difficulty || "Không xác định";
        const date = new Date(data.deadline);
        document.getElementById("assignmentDeadline").innerText = date.toLocaleDateString("vi-VN");
    } catch (err) {
        document.getElementById("assignmentTitle").innerText = "❌ Lỗi: " + err.message;
    }
}// done


// 🟢 select language
// 🟢 Load languages từ API
async function loadLanguages() {
    try {
        const res = await fetchWithToken(`${gatewayUrl}/get-languages`);
        if (!res.ok) throw new Error("Không tải được danh sách ngôn ngữ.");
        const data = await res.json();

        const container = document.getElementById("languageContainer");
        container.innerHTML = ""; // Xoá hết nút cũ

        data.forEach((lang, index) => {
            const btn = document.createElement("button");
            btn.className = "lang-btn";
            btn.setAttribute("data-id", lang.languageId);
            btn.textContent = lang.languageName;

            // Ngôn ngữ đầu tiên mặc định là active
            if (index === 0) {
                btn.classList.add("active");
                selectedLanguageId = lang.languageId;
            }

            // Khi click -> đổi trạng thái active + cập nhật ID
            btn.addEventListener("click", () => {
                document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                selectedLanguageId = lang.languageId;

                if (typeof setEditorLanguage === "function") {
                    setEditorLanguage(lang.languageName);
                }
            });

            container.appendChild(btn);
        });
    } catch (err) {
        console.error("Lỗi load languages:", err);
        const container = document.getElementById("languageContainer");
        container.innerHTML = "<p>Không tải được ngôn ngữ.</p>";
    }
}


// 🟢 Submit code
async function submitCode() {
    const id = document.getElementById("assignmentId").value;
    const body = {
        assignmentId: parseInt(id),
        sourceCode: getCode(),
        languageId: selectedLanguageId
    };

    try {
        const res = await fetchWithToken(`${gatewayUrl}/Submit`, {
            method: "POST",
            body: JSON.stringify(body)
        });
        if (res.ok) {

            alert("Nộp bài thành công!");
            window.location.href = `/StudentDashboard.html`;
            return;
        }

        const data = await res.json();
        document.getElementById("result").innerText = JSON.stringify(data, null, 2);
    } catch (err) {
        document.getElementById("result").innerText = "❌ " + err.message;
    }
}// done

// 🟢 Run code
async function runCode() {
    const id = document.getElementById("assignmentId").value;
    const body = {
        assignmentId: parseInt(id),
        sourceCode: getCode(),
        languageId: selectedLanguageId,
        stdin:""
    };

    try {
        const res = await fetchWithToken(`${gatewayUrl}/RunCode`, {
            method: "POST",
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error("Run failed, status " + res.status);

        const result = await res.json();
        const formatted = `
🟢 Status: ${result.status}
⏱️ Time: ${result.executionTime}
💾 Memory: ${result.memoryUsed} KB
📤 Output:
${result.output}

⚠️ Error Message:
${result.errorMessage}
        `;
        document.getElementById("result").innerText = formatted;
    } catch (err) {
        document.getElementById("result").innerText = "❌ " + err.message;
    }
}


// 🟢 Run code with Sample Testcase
async function runWithTestcase() {
    const id = document.getElementById("assignmentId").value;

    const body = {
        assignmentId: parseInt(id),
        sourceCode: getCode(),
        languageId: selectedLanguageId,
        stdin: testcaseExample
    };

    try {
        const res = await fetchWithToken(`${gatewayUrl}/RunCode`, {
            method: "POST",
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error("Run with sample testcase failed: " + res.status);

        const result = await res.json();
        const formatted = `
🧪 Sample Testcase Run
🟢 Status: ${result.status}
⏱️ Time: ${result.executionTime}
💾 Memory: ${result.memoryUsed} KB
📤 Output:
${result.output}

⚠️ Error Message:
${result.errorMessage}
        `;
        document.getElementById("result").innerText = formatted;
    } catch (err) {
        document.getElementById("result").innerText = "❌ " + err.message;
    }
}


loadAssignment();
loadLanguages();