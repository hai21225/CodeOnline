//const baseUrl = "http://localhost:5261";
const baseUrl = "http://52.184.80.181:5261";
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

    // ✅ Nếu token hết hạn hoặc không hợp lệ
    if (res.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        localStorage.clear(); // xoá token + info user
        window.location.href = "/Login.html"; // redirect về login
        return; // dừng tiếp
    }
    return res;
}

async function loadAssignments() {
    try {
        const res = await fetchWithToken(`${baseUrl}/GetAllAssignment`);
        const data = await res.json();

        const container = document.getElementById("assignmentContainer");
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
        alert("Không thể tải danh sách bài tập!");
    }
}

function openModal(assignment) {
    selectedAssignmentId = assignment.assignmentId;
    document.getElementById("modalTitle").innerText = assignment.title;
    document.getElementById("modalDescription").innerText = assignment.description || "Không có mô tả";
    document.getElementById("modalSampleTestcase").innerText = assignment.sampleTestCase;
    document.getElementById("modalDifficult").innerText = assignment.difficulty;
    document.getElementById("modalDeadline").innerText = assignment.deadline;
    document.getElementById("modalIsHidden").checked = Boolean(assignment.isHidden);
    document.getElementById("doAssignmentBtn").style.display = "inline-block";
    const modal = document.getElementById("assignmentModal");

    modal.style.display = "block";
    // Đóng popup bài tập
    document.getElementById("closeModalBtn").onclick = () => {
        document.getElementById("assignmentModal").style.display = "none";
    };
    // direct submission page
    document.getElementById("doAssignmentBtn").onclick = () => {
        if (selectedAssignmentId) {
            localStorage.setItem("currentAssignmentId", selectedAssignmentId);
            window.location.href = `/SubmissionPage.html`;
        }
    };
}

document.getElementById("modalIsHidden").addEventListener("change", async function () {
    const assignmentId = selectedAssignmentId;
    const isHidden = this.checked;
    try {
        const response = await fetchWithToken(`${baseUrl}/update-ishidden`, {
            method: "PUT",
            body: JSON.stringify({
                AssignmentId: assignmentId,
                IsHidden: isHidden
            })
        });

        if (!response.ok) throw new Error("Cập nhật thất bại");
        loadAssignments();
        console.log("Cập nhật IsHidden thành công:", isHidden);
    } catch (error) {
        console.error(error);
        // Nếu muốn, có thể revert checkbox khi lỗi:
        this.checked = !isHidden;
        alert("Cập nhật không thành công");
    }
});

// add assigmnet//////////////////////////////////////////////////////////////////////////////////
document.getElementById("addAssignmentBtn").onclick = () => {
    document.getElementById("addAssignmentModal").style.display = "flex";
};
document.getElementById("cancelAddBtn").onclick = () => {
    document.getElementById("addAssignmentModal").style.display = "none";
};
document.getElementById("addAssignmentForm").onsubmit = async (e) => {
    e.preventDefault();
    const newAssignment = {
        Title: document.getElementById("title").value,
        Description: document.getElementById("description").value,
        SampleTestCase: document.getElementById("sampleTestCase").value,
        Deadline: document.getElementById("deadline").value,
        Difficulty: document.getElementById("difficulty").value,
    };

    const res = await fetchWithToken(`${baseUrl}/AddAssignment`, {
        method: "POST",
        body: JSON.stringify(newAssignment),
    });

    if (res.ok) {
        alert("✅ Thêm bài tập thành công!");
        document.getElementById("addAssignmentModal").style.display = "none";
        loadAssignments();
    } else {
        alert("❌ Thêm thất bại!");
    }
};
/////////////////////////////update assignment/////////////////////////////////////////////////////////////////////

document.getElementById("updateAssignmentBtn").onclick = () => {
    const form = document.getElementById("updateAssignmentForm");

    form.reset();
    document.getElementById("updateAssignmentModal").style.display = "flex";

    document.getElementById("cancelUpdateBtn").onclick = () => {
        document.getElementById("updateAssignmentModal").style.display = "none";
    };
};
document.getElementById("updateAssignmentForm").onsubmit = async (e) => {
    e.preventDefault();

    const dataUpdate = {
        AssignmentId: selectedAssignmentId,
        Title: document.getElementById("updateTitle").value,
        Description: document.getElementById("updateDescription").value,
        SampleTestCase: document.getElementById("updateSampleTestCase").value,
        Deadline: document.getElementById("updateDeadline").value || null,
        Difficulty: document.getElementById("updateDifficulty").value
    };

    const res = await fetchWithToken(`${baseUrl}/UpdateAssignment`, {
        method: "PUT",
        body: JSON.stringify(dataUpdate),
    });

    if (res.ok) {
        alert("✅ cập nhật thành công!");
        document.getElementById("updateAssignmentModal").style.display = "none";
        loadAssignments();
    } else {
        alert("❌cập nhật thất bại!");
    }
};





////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////them testcase///////////////////////////////////////////////////////
document.getElementById("editAssignmentBtn").onclick = () => {
    document.getElementById("editAssignmentModal").style.display = "flex";
};

document.getElementById("cancelEditBtn").onclick = () => {
    document.getElementById("editAssignmentModal").style.display = "none";
};

// 📘 Thêm testcase mới
document.getElementById("addTestcaseBtn").onclick = () => {
    const tbody = document.getElementById("testcaseBody");
    const row = document.createElement("tr");
    row.innerHTML = `
        <td><textarea class="testcase-input" rows="3" placeholder="Nhập input..."></textarea></td>
        <td><textarea class="testcase-output" rows="3" placeholder="Nhập output mong đợi..."></textarea></td>
        <td><input type="number" class="weight-value" value="1" min="0" step="0.1"></td>
        <td><button class="removeRowBtn">❌</button></td>
    `;
    row.querySelector(".removeRowBtn").onclick = () => row.remove();
    const weightInput = row.querySelector(".weight-value");
    weightInput.addEventListener("input", () => {
        const value = parseFloat(weightInput.value);
        if (value < 0 || value > 1) {
            alert("Giá trị weight phải nằm trong khoảng từ 0 đến 1!");
            // Giới hạn lại giá trị
            weightInput.value = Math.max(0, Math.min(1, value || 0));
        }
    });
    tbody.appendChild(row);
};

document.getElementById("saveEditBtn").onclick = async () => {
    const testCases = [];
    document.querySelectorAll("#testcaseBody tr").forEach(row => {
        const input = row.querySelector(".testcase-input").value.trim();
        const output = row.querySelector(".testcase-output").value.trim();
        const weight = parseFloat(row.querySelector(".weight-value").value) || 1;
        testCases.push({ input, expectedOutput: output, weight });
    });

    const testCaseRequest = {
        AssignmentId: selectedAssignmentId,
        testCaseItems: testCases
    };

    try {
        await fetchWithToken(`${baseUrl}/AddTestCase`, {
            method: "POST",
            body: JSON.stringify(testCaseRequest)
        });
        alert("✅ Cập nhật chi tiết thành công!");
        document.getElementById("editAssignmentModal").style.display = "none";
    } catch (err) {
        alert("❌ Lỗi khi lưu dữ liệu!");
        console.error(err);
    }
};

//////////////////////////view/delete/update testcase //////////////////////////////
document.getElementById("viewTestcaseBtn").onclick = async () => {
    if (!selectedAssignmentId) return;

    try {
        // 🔹 Gọi API lấy danh sách test case theo bài tập
        const res = await fetchWithToken(`${baseUrl}/GetTestCaseById/${selectedAssignmentId}`);
        if (!res.ok) throw new Error("Không thể lấy danh sách test case");

        const data = await res.json();
        const container = document.querySelector("#viewTestCaseModal .modal-content");

        // 🔹 Xóa các nội dung cũ (nếu có)
        const oldCases = container.querySelectorAll(".testcase-item");
        oldCases.forEach(e => e.remove());

        // 🔹 Nếu không có testcase nào
        if (!data || data.length === 0) {
            const p = document.createElement("p");
            p.innerText = "Không có test case nào cho bài tập này.";
            p.classList.add("testcase-item");
            container.appendChild(p);
        } else {
            // 🔹 Duyệt qua từng test case
            data.forEach(test => {
                const div = document.createElement("div");
                div.classList.add("testcase-item");
                div.style.marginBottom = "10px";
                div.innerHTML = `
                    <p><strong>Input:</strong> <code>${test.input}</code></p>
                    <p><strong>Expected Output:</strong> <code>${test.expectedOutput}</code></p>
                    <p><strong>Weight:</strong> ${test.weight}</p>
                    <div class="modal-buttons">
                        <button type="button" class="updateTestCaseBtn" data-id="${test.testCaseId}">Chỉnh sửa</button>
                        <button type="button" class="deleteTestCaseBtn" data-id="${test.testCaseId}">Xóa</button>
                    </div>
                    <hr>
                `;
                container.appendChild(div);
            });
        }

        // 🔹 Hiển thị modal xem test case
        document.getElementById("viewTestCaseModal").style.display = "flex";

        // 🔹 Đóng modal
        document.getElementById("closeViewTestCaseBtn").onclick = () => {
            document.getElementById("viewTestCaseModal").style.display = "none";
        };


        document.querySelectorAll(".deleteTestCaseBtn").forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.id;
                if (!confirm("Bạn có chắc muốn xóa test case này không?")) return;

                try {
                    const delRes = await fetchWithToken(`${baseUrl}/delete-testcase-by/${id}`, {
                        method: "DELETE"
                    });
                    if (!delRes.ok) throw new Error("Xóa thất bại");
                    alert("✅ Đã xóa test case!");
                    btn.closest(".testcase-item").remove();
                } catch (err) {
                    console.error(err);
                    alert("❌ Lỗi khi xóa test case!");
                }
            };
        });

        document.querySelectorAll(".updateTestCaseBtn").forEach(btn => {
            btn.onclick = () => {
                const id = btn.dataset.id;
                const form = document.getElementById("updateTestcaseForm");
                form.dataset.id = id;
                form.reset();
                document.getElementById("updateTestcaseModal").style.display = "flex";

                document.getElementById("cancelUpdateTestcaseBtn").onclick = () => {
                    document.getElementById("updateTestcaseModal").style.display = "none";
                };
            };
        });

    } catch (err) {
        console.error(err);
        alert("⚠️ Lỗi khi tải test case!");
    }
};

document.getElementById("updateTestcaseForm").onsubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const id = form.dataset.id;
    const input = document.getElementById("updateInput").value.trim();
    const expectedOutput = document.getElementById("updateExpectedOutput").value.trim();
    const weight = document.querySelector("#updateTestcaseForm .weight-value").value

    if (isNaN(weight) || weight < 0 || weight > 1) {
        alert("⚠️ Weight phải nằm trong khoảng từ 0 đến 1!");
        return;
    }

    const updatedTestcase = {
        TestcaseId: id,
        Input: input,
        ExpectedOutput: expectedOutput,
        Weight: weight
    };

    // Gửi API cập nhật
    const res = await fetchWithToken(`${baseUrl}/update-testcase`, {
        method: "PUT",
        body: JSON.stringify(updatedTestcase)
    });

    if (res.ok) {
        alert("✅ Cập nhật thành công!");
        document.getElementById("updateTestcaseModal").style.display = "none";
        document.getElementById("viewTestCaseModal").style.display = "none";
    } else {
        alert("❌ Cập nhật thất bại!");
    }


};












///////////////////////////////////////////////////////////////////////////////////////


// 📘 Mở popup thêm Resource
document.getElementById("editResourceBtn").onclick = () => {
    document.getElementById("resourceModal").style.display = "flex";
};

// 📘 Đóng popup Resource
document.getElementById("cancelResourceBtn").onclick = () => {
    document.getElementById("resourceModal").style.display = "none";
};

// 📘 Gửi Resource mới
document.getElementById("resourceForm").onsubmit = async (e) => {
    e.preventDefault();
    const resource = {
        AssignmentId: selectedAssignmentId,
        ResourceTitle: document.getElementById("resourceTitleInput").value,
        ResourceLink: document.getElementById("resourceLinkInput").value,
        ResourceType: document.getElementById("resourceTypeInput").value,
    };

    const res = await fetchWithToken(`${baseUrl}/AddResource`, {
        method: "POST",
        body: JSON.stringify(resource),
    });

    if (res.ok) {
        alert("✅ Thêm Resource thành công!");
        document.getElementById("resourceModal").style.display = "none";
    } else {
        alert("❌ Lỗi khi thêm Resource!");
    }
};

////////////////////////////////////////////////////////////////////////////////////
//////////view resource//////////////////////////////////////////////////////////////////////////////
document.getElementById("viewResourceBtn").onclick = async () => {
    if (!selectedAssignmentId) return;

    try {
        const res = await fetchWithToken(`${baseUrl}/GetResourceById/${selectedAssignmentId}`);
        if (!res.ok) throw new Error("Không tìm thấy resource");
        const data = await res.json();

        const container = document.querySelector("#viewResourceModal .modal-content");

        const oldResources = container.querySelectorAll(".resource-item");
        oldResources.forEach(e => e.remove());

        if (!data || data.length === 0) {
            const p = document.createElement("p");
            p.innerText = "Không có tài nguyên nào cho bài tập này.";
            p.classList.add("resource-item");
            container.appendChild(p);
        } else {
            // Tạo danh sách tài nguyên
            data.forEach(resource => {
                const div = document.createElement("div");
                div.classList.add("resource-item");
                div.style.marginBottom = "10px";
                div.innerHTML = `
                <div class="modal-content">
                    <p><strong>Tiêu đề:</strong> ${resource.title}</p>
                    <p><strong>Loại:</strong> ${resource.type}</p>
                    <p><strong>Link:</strong> <a href="${resource.link}" target="_blank">${resource.link}</a></p>
                    <div class="modal-buttons">
                        <button type="button" class="updateResourceBtn" data-id="${resource.resourceId}">Chỉnh sửa</button>
                        <button type="button" class="deleteResourceBtn" data-id="${resource.resourceId}">Xóa</button>
                    </div>
                 </div>
                    <hr>
                `;
                container.appendChild(div);
            });
        }

        document.getElementById("viewResourceModal").style.display = "flex";

        // Gắn sự kiện cho nút xóa và chỉnh sửa
        document.querySelectorAll(".deleteResourceBtn").forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.id;
                if (!confirm("Bạn có chắc muốn xóa tài nguyên này không?")) return;
                try {
                    const delRes = await fetchWithToken(`${baseUrl}/delete-resource-by/${id}`,
                        { method: "DELETE" });
                    if (!delRes.ok) throw new Error("Xóa thất bại");
                    alert("Đã xóa tài nguyên!");
                    btn.closest(".resource-item").remove();
                } catch (err) {
                    console.error(err);
                    alert("Lỗi khi xóa tài nguyên!");
                }
            };
        });
        document.querySelectorAll(".updateResourceBtn").forEach(btn => {
            btn.onclick = () => {
                const id = btn.dataset.id;
                const form = document.getElementById("updateResourceForm");
                form.dataset.id = id;
                form.reset();
                document.getElementById("updateResourceModal").style.display = "flex";

                document.getElementById("cancelUpdateResourceBtn").onclick = () => {
                    document.getElementById("updateResourceModal").style.display = "none";
                };
            };
        });

    } catch (err) {
        console.warn(err);
        alert("Sẽ cập nhật trong thời gian tới!");
    }

    // Đóng popup Resource
    document.getElementById("closeViewResourceBtn").onclick = () => {
        document.getElementById("viewResourceModal").style.display = "none";
    };

};
document.getElementById("updateResourceForm").onsubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const id = form.dataset.id;

    const updatedData = {
        ResourceId: id,
        ResourceTitle: document.getElementById("updateResourceTitle").value,
        ResourceLink: document.getElementById("updateResourceLink").value,
        ResourceType: document.getElementById("updateResourceType").value
    };

    try {
        const res = await fetchWithToken(`${baseUrl}/update-resource`, {
            method: "PUT",
            body: JSON.stringify(updatedData)
        });

        if (!res.ok) throw new Error("Cập nhật thất bại!");
        alert("Cập nhật thành công!");
        document.getElementById("updateResourceModal").style.display = "none";
        document.getElementById("viewResourceBtn").click(); // reload danh sách
    } catch (err) {
        console.error(err);
        alert("Có lỗi xảy ra khi cập nhật!");
    }

};




////////////////////////////////////////////////////////////////////////////////////


document.getElementById("deleteAssignmentBtn").onclick = async () => {
    if (!selectedAssignmentId) {
        alert("Vui lòng chọn bài tập cần xóa!");
        return;
    }

    // Hiển thị popup xác nhận
    const confirmed = confirm("Bạn có chắc chắn muốn xóa bài tập này không? Hành động này không thể hoàn tác.");

    if (confirmed) {
        try {
            const response = await fetchWithToken(`${baseUrl}/Delete/${selectedAssignmentId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                alert("Xóa thành công!");
                document.getElementById("assignmentModal").style.display = "none";
                loadAssignments();
            } else {
                alert("Không thể xóa bài tập. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi khi kết nối tới server.");
        }
    }
};




loadAssignments();