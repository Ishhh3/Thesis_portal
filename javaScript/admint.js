const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

let allTeachers = [];
let allDepartments = [];
let currentTeacherId = null;
let currentTeacherName = null;
let currentSubjectId = null;
let currentSubjectName = null;
let currentSubjectCode = null;
let currentSections = [];
let currentStudentsData = [];
let currentSectionCode = null;
let modifiedGrades = new Map();
let gradesModified = false;
let currentSemester = null;
let currentSchoolYear = null;

window.addEventListener("load", () => {
    checkAuth();
    loadTeachers();
    loadDepartments();
    initializeEventListeners();
});

function checkAuth() {
    if (!loggedInUser || loggedInUser.role !== 'admin') {
        console.log("No admin logged in, redirecting to login");
        window.location.href = "login.html";
        return;
    }
}

function initializeEventListeners() {
    const searchInput = document.getElementById('teacherSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterTeachers);
    }

    const departmentFilter = document.getElementById('departmentFilter');
    if (departmentFilter) {
        departmentFilter.addEventListener('change', filterTeachers);
    }

    const resetButton = document.getElementById('resetTeacherFilters');
    if (resetButton) {
        resetButton.addEventListener('click', resetFilters);
    }

    const bulkToggle = document.getElementById('enableEncodingToggle');
    if (bulkToggle) {
        bulkToggle.addEventListener('change', handleBulkEncodingToggle);
    }

    const bulkFinalToggle = document.getElementById('enableFinalEncodingToggle');
    if (bulkFinalToggle) {
        bulkFinalToggle.addEventListener('change', handleBulkFinalEncodingToggle);
    }

    const sectionSelect = document.getElementById('sectionSelect');
    if (sectionSelect) {
        sectionSelect.addEventListener('change', handleSectionChange);
    }

    const saveGradesBtn = document.getElementById('saveGradesBtn');
    if (saveGradesBtn) {
        saveGradesBtn.addEventListener('click', saveAllGrades);
    }
}

async function loadTeachers() {
    try {
        const response = await fetch('https://mseufportal.onrender.com/admin/teachers', {
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allTeachers = await response.json();
        filterTeachers();
        updateBulkToggleState();
        updateBulkFinalToggleState();
    } catch (error) {
        console.error('Error loading teachers:', error);
        showAlert('Error loading teachers data', 'danger');
    }
}

async function loadDepartments() {
    try {
        const response = await fetch('https://mseufportal.onrender.com/admin/departments', {
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allDepartments = await response.json();
        populateDepartmentFilter();
    } catch (error) {
        console.error('Error loading departments:', error);
    }
}

function populateDepartmentFilter() {
    const departmentFilter = document.getElementById('departmentFilter');
    if (!departmentFilter) return;

    departmentFilter.innerHTML = '<option value="">All Active Teachers</option>';

    allDepartments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept.department_name;
        option.textContent = dept.department_name;
        departmentFilter.appendChild(option);
    });

    const archivedOption = document.createElement('option');
    archivedOption.value = 'archived';
    archivedOption.textContent = 'Archived Teachers';
    departmentFilter.appendChild(archivedOption);
}

function renderTeachers(teachers) {
    const tbody = document.querySelector('#teachersTable tbody');
    if (!tbody) return;

    if (teachers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No teachers found</td></tr>';
        return;
    }

    tbody.innerHTML = teachers.map(teacher => {
        const isEnabled = teacher.encode === 'on';
        const isFinalEnabled = teacher.final_encode === 'on';
        const isArchived = teacher.archive === 'on';

        return `
            <tr data-teacher-id="${teacher.teacher_id}" 
                data-encoding-enabled="${isEnabled}" 
                data-final-encoding-enabled="${isFinalEnabled}"
                data-archived="${isArchived}">
                <td>${teacher.teacherUser_id}</td>
                <td>
                    <a href="#" class="teacher-name" onclick="showTeacherClasses(${teacher.teacher_id}, '${teacher.full_name}'); return false;">
                        ${teacher.full_name}
                    </a>
                </td>
                <td>${teacher.department_name}</td>
                <td>${teacher.email || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm ${isEnabled ? 'btn-success' : 'btn-danger'} encoding-btn me-1" 
                            onclick="toggleEncoding(this, ${teacher.teacher_id})" 
                            title="${isEnabled ? 'Midterm Encoding Enabled' : 'Midterm Encoding Disabled'}">
                        <i class="bi ${isEnabled ? 'bi-unlock-fill' : 'bi-lock-fill'}"></i> 
                        M: ${isEnabled ? 'On' : 'Off'}
                    </button>
                    <button class="btn btn-sm ${isFinalEnabled ? 'btn-success' : 'btn-danger'} final-encoding-btn me-1" 
                            onclick="toggleFinalEncoding(this, ${teacher.teacher_id})" 
                            title="${isFinalEnabled ? 'Final Encoding Enabled' : 'Final Encoding Disabled'}">
                        <i class="bi ${isFinalEnabled ? 'bi-unlock-fill' : 'bi-lock-fill'}"></i> 
                        F: ${isFinalEnabled ? 'On' : 'Off'}
                    </button>
                    ${isArchived ? 
                        `<button class="btn btn-sm btn-warning" onclick="unarchiveTeacher(${teacher.teacher_id})">
                            <i class="bi bi-arrow-counterclockwise"></i> Unarchive
                        </button>` :
                        `<button class="btn btn-sm btn-secondary" onclick="archiveTeacher(${teacher.teacher_id})">
                            <i class="bi bi-archive"></i> Archive
                        </button>`
                    }
                </td>
            </tr>
        `;
    }).join('');
}

function filterTeachers() {
    const searchValue = document.getElementById('teacherSearch')?.value.toLowerCase() || '';
    const departmentValue = document.getElementById('departmentFilter')?.value || '';

    let filtered = allTeachers.filter(teacher => {
        const matchesSearch = 
            teacher.teacherUser_id.toLowerCase().includes(searchValue) ||
            teacher.full_name.toLowerCase().includes(searchValue) ||
            teacher.email?.toLowerCase().includes(searchValue);

        let matchesDepartment = true;
        if (departmentValue === 'archived') {
            matchesDepartment = teacher.archive === 'on';
        } else if (departmentValue) {
            matchesDepartment = teacher.department_name === departmentValue && teacher.archive !== 'on';
        } else {
            matchesDepartment = teacher.archive !== 'on';
        }

        return matchesSearch && matchesDepartment;
    });

    renderTeachers(filtered);
}

function resetFilters() {
    document.getElementById('teacherSearch').value = '';
    document.getElementById('departmentFilter').value = '';
    renderTeachers(allTeachers.filter(t => t.archive !== 'on'));
}

function updateBulkToggleState() {
    const bulkToggle = document.getElementById('enableEncodingToggle');
    if (!bulkToggle) return;

    const hasAnyEnabled = allTeachers.some(teacher => 
        teacher.archive !== 'on' && teacher.encode === 'on'
    );

    bulkToggle.removeEventListener('change', handleBulkEncodingToggle);
    bulkToggle.checked = hasAnyEnabled;
    bulkToggle.addEventListener('change', handleBulkEncodingToggle);
}

function updateBulkFinalToggleState() {
    const bulkFinalToggle = document.getElementById('enableFinalEncodingToggle');
    if (!bulkFinalToggle) return;

    const hasAnyEnabled = allTeachers.some(teacher => 
        teacher.archive !== 'on' && teacher.final_encode === 'on'
    );

    bulkFinalToggle.removeEventListener('change', handleBulkFinalEncodingToggle);
    bulkFinalToggle.checked = hasAnyEnabled;
    bulkFinalToggle.addEventListener('change', handleBulkFinalEncodingToggle);
}

async function toggleEncoding(button, teacherId) {
    const row = button.closest('tr');
    const currentStatus = row.dataset.encodingEnabled === 'true';
    const newStatus = !currentStatus;

    try {
        const response = await fetch(`https://mseufportal.onrender.com/admin/toggle-encoding/${teacherId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: newStatus }),
            mode: 'cors'
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        row.dataset.encodingEnabled = newStatus;
        const teacher = allTeachers.find(t => t.teacher_id === teacherId);
        if (teacher) teacher.encode = newStatus ? 'on' : 'off';

        updateEncodingButton(button, newStatus);
        updateBulkToggleState();

        showAlert(`Midterm encoding ${newStatus ? 'enabled' : 'disabled'} successfully`, 'success');
    } catch (error) {
        console.error('Error toggling encoding:', error);
        showAlert('Error updating midterm encoding status', 'danger');
    }
}

async function toggleFinalEncoding(button, teacherId) {
    const row = button.closest('tr');
    const currentStatus = row.dataset.finalEncodingEnabled === 'true';
    const newStatus = !currentStatus;

    try {
        const response = await fetch(`https://mseufportal.onrender.com/admin/toggle-final-encoding/${teacherId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: newStatus }),
            mode: 'cors'
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        row.dataset.finalEncodingEnabled = newStatus;
        const teacher = allTeachers.find(t => t.teacher_id === teacherId);
        if (teacher) teacher.final_encode = newStatus ? 'on' : 'off';

        updateFinalEncodingButton(button, newStatus);
        updateBulkFinalToggleState();

        showAlert(`Final encoding ${newStatus ? 'enabled' : 'disabled'} successfully`, 'success');
    } catch (error) {
        console.error('Error toggling final encoding:', error);
        showAlert('Error updating final encoding status', 'danger');
    }
}

function updateEncodingButton(button, isEnabled) {
    button.className = `btn btn-sm ${isEnabled ? 'btn-success' : 'btn-danger'} encoding-btn me-1`;
    button.title = isEnabled ? 'Midterm Encoding Enabled' : 'Midterm Encoding Disabled';
    button.innerHTML = `<i class="bi ${isEnabled ? 'bi-unlock-fill' : 'bi-lock-fill'}"></i> M: ${isEnabled ? 'On' : 'Off'}`;
}

function updateFinalEncodingButton(button, isEnabled) {
    button.className = `btn btn-sm ${isEnabled ? 'btn-success' : 'btn-danger'} final-encoding-btn me-1`;
    button.title = isEnabled ? 'Final Encoding Enabled' : 'Final Encoding Disabled';
    button.innerHTML = `<i class="bi ${isEnabled ? 'bi-unlock-fill' : 'bi-lock-fill'}"></i> F: ${isEnabled ? 'On' : 'Off'}`;
}

async function handleBulkEncodingToggle(event) {
    const enabled = event.target.checked;
    const teacherIds = allTeachers.filter(t => t.archive !== 'on').map(t => t.teacher_id);

    if (teacherIds.length === 0) {
        showAlert('No active teachers to update', 'warning');
        event.target.checked = !enabled;
        return;
    }

    try {
        const response = await fetch('https://mseufportal.onrender.com/admin/toggle-encoding-bulk', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacherIds, enabled }),
            mode: 'cors'
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        allTeachers.forEach(teacher => {
            if (teacher.archive !== 'on') teacher.encode = enabled ? 'on' : 'off';
        });

        filterTeachers();
        showAlert(`Midterm encoding ${enabled ? 'enabled' : 'disabled'} for all active teachers`, 'success');
    } catch (error) {
        console.error('Error in bulk toggle:', error);
        showAlert('Error updating midterm encoding status', 'danger');
        event.target.checked = !enabled;
    }
}

async function handleBulkFinalEncodingToggle(event) {
    const enabled = event.target.checked;
    const teacherIds = allTeachers.filter(t => t.archive !== 'on').map(t => t.teacher_id);

    if (teacherIds.length === 0) {
        showAlert('No active teachers to update', 'warning');
        event.target.checked = !enabled;
        return;
    }

    try {
        const response = await fetch('https://mseufportal.onrender.com/admin/toggle-final-encoding-bulk', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacherIds, enabled }),
            mode: 'cors'
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        allTeachers.forEach(teacher => {
            if (teacher.archive !== 'on') teacher.final_encode = enabled ? 'on' : 'off';
        });

        filterTeachers();
        showAlert(`Final encoding ${enabled ? 'enabled' : 'disabled'} for all active teachers`, 'success');
    } catch (error) {
        console.error('Error in bulk final toggle:', error);
        showAlert('Error updating final encoding status', 'danger');
        event.target.checked = !enabled;
    }
}

async function archiveTeacher(teacherId) {
    if (!confirm('Are you sure you want to archive this teacher?')) return;

    try {
        const response = await fetch('https://mseufportal.onrender.com/admin/archive-teacher', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacherId }),
            mode: 'cors'
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const teacher = allTeachers.find(t => t.teacher_id === teacherId);
        if (teacher) teacher.archive = 'on';

        filterTeachers();
        showAlert('Teacher archived successfully', 'success');
    } catch (error) {
        console.error('Error archiving teacher:', error);
        showAlert('Error archiving teacher', 'danger');
    }
}

async function unarchiveTeacher(teacherId) {
    if (!confirm('Are you sure you want to unarchive this teacher?')) return;

    try {
        const response = await fetch('https://mseufportal.onrender.com/admin/unarchive-teacher', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacherId }),
            mode: 'cors'
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const teacher = allTeachers.find(t => t.teacher_id === teacherId);
        if (teacher) teacher.archive = 'off';

        filterTeachers();
        showAlert('Teacher unarchived successfully', 'success');
    } catch (error) {
        console.error('Error unarchiving teacher:', error);
        showAlert('Error unarchiving teacher', 'danger');
    }
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    if (sidebar) sidebar.classList.toggle("active");
    if (overlay) overlay.classList.toggle("active");
}

function closeSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    if (sidebar) sidebar.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
}

function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

async function showTeacherClasses(teacherId, teacherName) {
    currentTeacherId = teacherId;
    currentTeacherName = teacherName;
    document.getElementById('teacherNameDisplay').textContent = teacherName;
    const modal = new bootstrap.Modal(document.getElementById('teacherClassesModal'));
    modal.show();
    await loadTeacherClasses(teacherId);
}

async function loadTeacherClasses(teacherId) {
    const tbody = document.getElementById('teacherClassesTableBody');
    tbody.innerHTML = '<tr><td colspan="3" class="text-center"><div class="spinner-border text-maroon" role="status"></div></td></tr>';
    
    try {
        const response = await fetch(`https://mseufportal.onrender.com/admin/teacher-classes/${teacherId}`, { mode: 'cors' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const classes = await response.json();
        
        if (classes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No classes assigned</td></tr>';
            return;
        }
        
        const groupedClasses = {};
        classes.forEach(cls => {
            const key = `${cls.subject_code}-${cls.subject_id}`;
            if (!groupedClasses[key]) {
                groupedClasses[key] = {
                    subject_id: cls.subject_id,
                    subject_code: cls.subject_code,
                    subject_name: cls.subject_name,
                    sections: [],
                    total_students: 0
                };
            }
            groupedClasses[key].sections.push(cls.sectionCode);
            groupedClasses[key].total_students += parseInt(cls.student_count) || 0;
        });
        
        tbody.innerHTML = Object.values(groupedClasses).map(cls => `
            <tr>
                <td><strong>${cls.subject_code}</strong></td>
                <td>${cls.subject_name} <span class="text-muted">(${cls.sections.length} section${cls.sections.length > 1 ? 's' : ''})</span></td>
                <td>
                    <button class="btn btn-maroon btn-sm" onclick="viewClassStudents(${cls.subject_id}, '${cls.subject_name}', '${cls.subject_code}')">
                        <i class="bi bi-eye"></i> View Students
                        <span class="badge bg-light text-dark ms-1">${cls.total_students}</span>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading teacher classes:', error);
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Error loading classes</td></tr>';
    }
}

async function viewClassStudents(subjectId, subjectName, subjectCode) {
    currentSubjectId = subjectId;
    currentSubjectName = subjectName;
    currentSubjectCode = subjectCode;
    modifiedGrades.clear();
    gradesModified = false;
    updateExportButton();
    
    const teacherClassesModal = bootstrap.Modal.getInstance(document.getElementById('teacherClassesModal'));
    if (teacherClassesModal) teacherClassesModal.hide();
    
    document.getElementById('studentsModalTitle').textContent = `${subjectCode} - ${subjectName}`;
    const studentsModal = new bootstrap.Modal(document.getElementById('studentsListModal'));
    studentsModal.show();
    
    await loadSubjectSections(subjectId);
}

async function loadSubjectSections(subjectId) {
    const sectionSelect = document.getElementById('sectionSelect');
    const tbody = document.getElementById('classStudentsTableBody');
    const saveBtn = document.getElementById('saveGradesBtn');
    
    saveBtn.style.display = 'none';
    sectionSelect.innerHTML = '<option value="">Loading sections...</option>';
    tbody.innerHTML = '<tr><td colspan="5" class="text-center"><div class="spinner-border text-maroon spinner-border-sm"></div> Loading sections...</td></tr>';
    
    try {
        const response = await fetch(`https://mseufportal.onrender.com/admin/teacher-sections/${currentTeacherId}/${subjectId}`, { mode: 'cors' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        currentSections = await response.json();
        
        if (currentSections.length === 0) {
            sectionSelect.innerHTML = '<option value="">No sections available</option>';
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No sections available for this subject</td></tr>';
            return;
        }
        
        sectionSelect.innerHTML = '<option value="">Select a section...</option>' + 
            currentSections.map(section => 
                `<option value="${section.sectionCode}">Section ${section.sectionCode} (${section.student_count || 0} students)</option>`
            ).join('');
        
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Select a section to view students</td></tr>';
    } catch (error) {
        console.error('Error loading sections:', error);
        sectionSelect.innerHTML = '<option value="">Error loading sections</option>';
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading sections</td></tr>';
    }
}

async function handleSectionChange() {
    const sectionCode = this.value;
    const tbody = document.getElementById('classStudentsTableBody');
    const saveBtn = document.getElementById('saveGradesBtn');
    
    currentSectionCode = sectionCode;
    modifiedGrades.clear();
    gradesModified = false;
    saveBtn.style.display = 'none';
    updateExportButton();
    
    if (!sectionCode) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Select a section to view students</td></tr>';
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="5" class="text-center"><div class="spinner-border text-maroon spinner-border-sm"></div> Loading students...</td></tr>';
    
    try {
        const response = await fetch(`https://mseufportal.onrender.com/admin/class-students/${currentTeacherId}/${currentSubjectId}/${sectionCode}`, { mode: 'cors' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        currentStudentsData = await response.json();
        
        // Extract semester and school year from the first student record
        if (currentStudentsData.length > 0) {
            currentSemester = currentStudentsData[0].semester || '1st';
            currentSchoolYear = currentStudentsData[0].schoolyear || '2024-2025';
        }
        
        if (currentStudentsData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No students enrolled in this section</td></tr>';
            return;
        }
        
        renderStudentsWithEditableGrades(currentStudentsData);
        saveBtn.style.display = 'inline-block';
    } catch (error) {
        console.error('Error loading students:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading students</td></tr>';
    }
}

function updateExportButton() {
    const exportDropdown = document.querySelector('.btn-group .btn-success.dropdown-toggle');
    if (exportDropdown) {
        if (gradesModified) {
            exportDropdown.disabled = false;
            exportDropdown.style.cursor = 'pointer';
            exportDropdown.style.opacity = '1';
            exportDropdown.title = 'Export grades to PDF';
        } else {
            exportDropdown.disabled = true;
            exportDropdown.style.cursor = 'not-allowed';
            exportDropdown.style.opacity = '0.6';
            exportDropdown.title = 'Please save grades before exporting';
        }
    }
}

function renderStudentsWithEditableGrades(students) {
    const tbody = document.getElementById('classStudentsTableBody');
    
    const finalGradeOptions = [
        { value: '', label: '-- Select --' },
        { value: '1.00', label: '1.00' },
        { value: '1.25', label: '1.25' },
        { value: '1.50', label: '1.50' },
        { value: '1.75', label: '1.75' },
        { value: '2.00', label: '2.00' },
        { value: '2.25', label: '2.25' },
        { value: '2.50', label: '2.50' },
        { value: '2.75', label: '2.75' },
        { value: '3.00', label: '3.00' },
        { value: '5.00', label: '5.00 (Failed)' },
        { value: '6.00', label: 'INC (Incomplete)' },
        { value: '0.00', label: '0.00 (Dropped)' }
    ];
    
    tbody.innerHTML = students.map((student, index) => {
        const midtermValue = student.midterm_grade !== null ? Math.round(student.midterm_grade) : '';
        const finalValue = student.final_grade !== null ? student.final_grade : '';
        
        let remarks = '-';
        let remarksClass = 'text-muted';

        if (student.final_grade !== null) {
            const finalGradeNum = parseFloat(student.final_grade);
            if (finalGradeNum >= 1.00 && finalGradeNum <= 3.00) {
                remarks = 'Passed';
                remarksClass = 'text-success';
            } else if (finalGradeNum === 0 || finalGradeNum === 0.00) {
                remarks = 'Dropped';
                remarksClass = 'text-warning';
            } else if (finalGradeNum === 5.00) {
                remarks = 'Failed';
                remarksClass = 'text-danger';
            } else if (finalGradeNum === 6.00 || Math.abs(finalGradeNum - 6.00) < 0.01) {
                remarks = 'Incomplete';
                remarksClass = 'text-primary';
            } else {
                remarks = 'Invalid Grade';
                remarksClass = 'text-danger';
            }
        }
        
        const optionsHTML = finalGradeOptions.map(opt => {
            const selected = finalValue && parseFloat(finalValue) === parseFloat(opt.value) ? 'selected' : '';
            return `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
        }).join('');
        
        return `
            <tr data-student-user-id="${student.studentUser_id}">
                <td>${student.student_id || `S${(index + 1).toString().padStart(3, '0')}`}</td>
                <td>${student.student_name || 'Unknown Student'}</td>
                <td class="text-center">
                    <input type="number" 
                           class="grade-input" 
                           data-type="midterm"
                           data-student-id="${student.studentUser_id}"
                           value="${midtermValue}"
                           min="0"
                           max="100"
                           step="1"
                           onchange="handleGradeChange(this)">
                </td>
                <td class="text-center">
                    <select class="grade-input grade-select" 
                            data-type="final"
                            data-student-id="${student.studentUser_id}"
                            onchange="handleGradeChange(this)">
                        ${optionsHTML}
                    </select>
                </td>
                <td class="text-center ${remarksClass} fw-bold" id="remarks-${student.studentUser_id}">${remarks}</td>
            </tr>
        `;
    }).join('');
}

function handleGradeChange(input) {
    const studentId = input.dataset.studentId;
    const gradeType = input.dataset.type;
    let value = input.value;
    
    if (!modifiedGrades.has(studentId)) {
        const student = currentStudentsData.find(s => s.studentUser_id == studentId);
        modifiedGrades.set(studentId, {
            studentUser_id: studentId,
            midterm_grade: student.midterm_grade,
            final_grade: student.final_grade
        });
    }
    
    const gradeData = modifiedGrades.get(studentId);
    if (gradeType === 'midterm') {
        if (value !== '') {
            value = Math.round(parseFloat(value));
            input.value = value;
        }
        gradeData.midterm_grade = value === '' ? null : parseInt(value);
    } else {
        gradeData.final_grade = value === '' ? null : parseFloat(value);
    }
    
    input.classList.add('modified');
    updateRemarks(studentId, gradeData.final_grade);
}

function updateRemarks(studentId, finalGrade) {
    const remarksCell = document.getElementById(`remarks-${studentId}`);
    if (!remarksCell) return;
    
    let remarks = '-';
    let remarksClass = 'text-muted';
    
    if (finalGrade !== null && finalGrade !== '') {
        const finalGradeNum = parseFloat(finalGrade);
        if (finalGradeNum >= 1.00 && finalGradeNum <= 3.00) {
            remarks = 'Passed';
            remarksClass = 'text-success';
        } else if (finalGradeNum === 0 || finalGradeNum === 0.00) {
            remarks = 'Dropped';
            remarksClass = 'text-warning';
        } else if (finalGradeNum === 5.00) {
            remarks = 'Failed';
            remarksClass = 'text-danger';
        } else if (finalGradeNum === 6.00 || Math.abs(finalGradeNum - 6.00) < 0.01) {
            remarks = 'Incomplete';
            remarksClass = 'text-primary';
        } else {
            remarks = 'Invalid Grade';
            remarksClass = 'text-danger';
        }
    }
    
    remarksCell.className = `text-center ${remarksClass} fw-bold`;
    remarksCell.textContent = remarks;
}

async function saveAllGrades() {
    const saveBtn = document.getElementById('saveGradesBtn');
    
    // If no changes, just enable export and show info message
    if (modifiedGrades.size === 0) {
        showAlert('No changes to save. Export is now enabled.', 'info');
        gradesModified = true;
        updateExportButton();
        return;
    }
    
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Saving...';
    
    try {
        const response = await fetch('https://mseufportal.onrender.com/admin/update-grades-bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                teacher_id: currentTeacherId,
                subject_id: currentSubjectId,
                grades: Array.from(modifiedGrades.values())
            }),
            mode: 'cors'
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();
        
        if (result.success) {
            showAlert(`Successfully saved ${result.updatedCount} grade(s)`, 'success');
            modifiedGrades.clear();
            
            document.querySelectorAll('.grade-input.modified').forEach(input => {
                input.classList.remove('modified');
            });
            
            // Reload section data to show updated grades
            const sectionSelect = document.getElementById('sectionSelect');
            const sectionCode = sectionSelect.value;
            
            if (sectionCode) {
                const tbody = document.getElementById('classStudentsTableBody');
                tbody.innerHTML = '<tr><td colspan="5" class="text-center"><div class="spinner-border text-maroon spinner-border-sm"></div> Refreshing data...</td></tr>';
                
                try {
                    const response = await fetch(`https://mseufportal.onrender.com/admin/class-students/${currentTeacherId}/${currentSubjectId}/${sectionCode}`, { mode: 'cors' });
                    if (response.ok) {
                        currentStudentsData = await response.json();
                        
                        // Extract semester and school year from the first student record
                        if (currentStudentsData.length > 0) {
                            currentSemester = currentStudentsData[0].semester || currentSemester || '1st';
                            currentSchoolYear = currentStudentsData[0].schoolyear || currentSchoolYear || '2024-2025';
                        }
                        
                        renderStudentsWithEditableGrades(currentStudentsData);
                    }
                } catch (error) {
                    console.error('Error refreshing data:', error);
                }
            }
            
            // Set gradesModified to true AFTER reloading to keep export enabled
            gradesModified = true;
            updateExportButton();
        } else {
            showAlert('Failed to save some grades', 'warning');
        }
    } catch (error) {
        console.error('Error saving grades:', error);
        showAlert('Error saving grades', 'danger');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="bi bi-save"></i> Save Grades';
    }
}

async function exportGradesToPDF(gradeType) {
    if (!gradesModified) {
        showAlert('Please save grades before exporting', 'warning');
        return;
    }
    
    if (!currentSectionCode) {
        showAlert('Please select a section first', 'warning');
        return;
    }
    
    if (currentStudentsData.length === 0) {
        showAlert('No students to export', 'warning');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        doc.setFontSize(9);
        doc.text(`${dateStr} ${timeStr}`, 14, 15);
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        const schoolName = 'MANUEL S. ENVERGA UNIVERSITY FOUNDATION';
        const schoolNameWidth = doc.getTextWidth(schoolName);
        doc.text(schoolName, (doc.internal.pageSize.width - schoolNameWidth) / 2, 20);
        
        doc.setFontSize(12);
        const subtitle = 'CANDELARIA INC.';
        const subtitleWidth = doc.getTextWidth(subtitle);
        doc.text(subtitle, (doc.internal.pageSize.width - subtitleWidth) / 2, 26);
        
        doc.setFontSize(10);
        const office = 'OFFICE OF THE REGISTRAR';
        const officeWidth = doc.getTextWidth(office);
        doc.text(office, (doc.internal.pageSize.width - officeWidth) / 2, 32);
        
        doc.setLineWidth(0.5);
        doc.line(14, 36, doc.internal.pageSize.width - 14, 36);
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        let yPos = 45;
        
        doc.setFont(undefined, 'bold');
        doc.text('Subject:', 14, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(`${currentSubjectCode} - ${currentSubjectName}`, 40, yPos);
        
        yPos += 6;
        doc.setFont(undefined, 'bold');
        doc.text('Section:', 14, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(currentSectionCode, 40, yPos);
        
        yPos += 6;
        doc.setFont(undefined, 'bold');
        doc.text('Teacher:', 14, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(currentTeacherName, 40, yPos);
        
        const rightX = 120;
        yPos = 45;
        
        const subjectResponse = await fetch(`https://mseufportal.onrender.com/subject/${currentSubjectId}`, { mode: 'cors' });
        const subjectData = await subjectResponse.json();
        const subjectUnit = subjectData.unit || 'N/A';
        
        doc.setFont(undefined, 'bold');
        doc.text('Unit:', rightX, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(String(subjectUnit), rightX + 20, yPos);
        
        yPos += 6;
        doc.setFont(undefined, 'bold');
        doc.text('Semester:', rightX, yPos);
        doc.setFont(undefined, 'normal');
        const semesterDisplay = currentSemester === '1st' ? '1st Semester' : 
                               currentSemester === '2nd' ? '2nd Semester' : 
                               currentSemester === 'summer' ? 'Summer' : 
                               currentSemester || '1st Semester';
        doc.text(semesterDisplay, rightX + 20, yPos);
        
        yPos += 6;
        doc.setFont(undefined, 'bold');
        doc.text('S.Y.:', rightX, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(currentSchoolYear || '2024-2025', rightX + 20, yPos);
        
        // Sort students alphabetically by last name
        const sortedStudents = [...currentStudentsData].sort((a, b) => {
            const nameA = a.student_name || '';
            const nameB = b.student_name || '';
            const lastNameA = nameA.split(' ').pop().toLowerCase();
            const lastNameB = nameB.split(' ').pop().toLowerCase();
            return lastNameA.localeCompare(lastNameB);
        });
        
        const tableHeaders = gradeType === 'midterm' 
            ? ['No.', 'Student ID', 'Student Name', 'Midterm Grade', 'Remarks']
            : ['No.', 'Student ID', 'Student Name', 'Final Grade', 'Remarks'];
        
        const tableData = sortedStudents.map((student, index) => {
            // Use the actual student_id from the database, not a generated one
            const studentId = student.student_id || 'N/A';
            
            // Format name as: Last Name, First Name Middle Initial
            let formattedName = student.student_name || 'Unknown Student';
            if (student.student_name) {
                const nameParts = student.student_name.split(' ');
                if (nameParts.length >= 3) {
                    const firstName = nameParts[0];
                    const middleInitial = nameParts[1];
                    const lastName = nameParts.slice(2).join(' ');
                    formattedName = `${lastName}, ${firstName} ${middleInitial}`;
                } else if (nameParts.length === 2) {
                    const firstName = nameParts[0];
                    const lastName = nameParts[1];
                    formattedName = `${lastName}, ${firstName}`;
                }
            }
            const studentName = formattedName;
            
            if (gradeType === 'midterm') {
                const midtermGrade = student.midterm_grade !== null ? Math.round(student.midterm_grade) : '-';
                let remarks = '-';
                
                if (student.midterm_grade !== null) {
                    const midtermGradeNum = Math.round(student.midterm_grade);
                    if (midtermGradeNum < 75) {
                        remarks = 'Failed';
                    } else {
                        remarks = 'Passed';
                    }
                }
                
                return [index + 1, studentId, studentName, midtermGrade, remarks];
            } else {
                let finalGrade = student.final_grade !== null ? student.final_grade : '-';
                let remarks = '-';
                
                if (student.final_grade !== null) {
                    const finalGradeNum = parseFloat(student.final_grade);
                    
                    // Display INC instead of 6.00
                    if (finalGradeNum === 6.00) {
                        finalGrade = 'INC';
                        remarks = 'Incomplete';
                    } else if (finalGradeNum >= 1.00 && finalGradeNum <= 3.00) {
                        remarks = 'Passed';
                    } else if (finalGradeNum === 0 || finalGradeNum === 0.00) {
                        remarks = 'Dropped';
                    } else if (finalGradeNum === 5.00) {
                        remarks = 'Failed';
                    }
                }
                
                return [index + 1, studentId, studentName, finalGrade, remarks];
            }
        });
        
        doc.autoTable({
            startY: yPos + 8,
            head: [tableHeaders],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [128, 0, 0],
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center'
            },
            styles: {
                fontSize: 9,
                cellPadding: 3
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15 },
                1: { halign: 'center', cellWidth: 25 },
                2: { halign: 'left', cellWidth: 70 },
                3: { halign: 'center', cellWidth: 30 },
                4: { halign: 'center', cellWidth: 30 }
            }
        });
        
        const footerY = doc.internal.pageSize.height - 20;
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        const instructorLabel = 'Instructor: ';
        const instructorLabelWidth = doc.getTextWidth(instructorLabel);
        doc.text(instructorLabel, 14, footerY);
        
        doc.setFont(undefined, 'normal');
        doc.text(currentTeacherName, 14 + instructorLabelWidth, footerY);
        
        const deanX = doc.internal.pageSize.width / 2 + 20;
        doc.setFont(undefined, 'bold');
        const deanLabel = 'Dean: ';
        const deanLabelWidth = doc.getTextWidth(deanLabel);
        doc.text(deanLabel, deanX, footerY);
        
        doc.setFont(undefined, 'normal');
        const deanName = 'Dr. Maria Santos';  // Replace with actual dean name
        doc.text(deanName, deanX + deanLabelWidth, footerY);
        
        const fileName = `${currentSubjectCode}_${currentSectionCode}_${gradeType}_grades_${dateStr.replace(/\s+/g, '_')}.pdf`;
        doc.save(fileName);
        
        showAlert(`PDF exported successfully: ${gradeType} grades`, 'success');
    } catch (error) {
        console.error('Error exporting PDF:', error);
        showAlert('Error exporting PDF', 'danger');
    }
}