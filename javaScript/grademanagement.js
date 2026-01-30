window.addEventListener("load", () => {
    loadTeacherInfo();
    loadTeacherClasses();
});

function loadTeacherInfo() {
    if (!loggedInUser || !loggedInUser.teacher_id) {
        return;
    }
    
    fetch(`https://mseufportal.onrender.com/teacher/dashboard/${loggedInUser.teacher_id}`, { mode: "cors" })
        .then(response => response.json())
        .then(teacher => {
            teacherName = teacher.full_name;
        })
        .catch(error => {
            console.error("Error fetching teacher info:", error);
        });
}

const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
let currentSubjectId = null;
let currentSubjectName = null;
let currentSectionCode = null;
let studentGrades = [];
let teacherName = '';
let currentSemester = '1st';
let currentSchoolYear = '2024-2025';
let currentSubjectUnit = 0;
let gradesSubmitted = false;
let currentYearFilter = 'all';
let currentSemesterFilter = 'all';

function loadTeacherClasses() {
    if (!loggedInUser || !loggedInUser.teacher_id) {
        showError("Please log in to view your classes");
        return;
    }

    const teacherId = loggedInUser.teacher_id;
    const link = `https://mseufportal.onrender.com/teacher/classes/${teacherId}`;

    fetch(link, { mode: "cors" })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((classes) => {
            displayClassCards(classes);
        })
        .catch((error) => {
            console.error("Error fetching classes:", error);
            showError("Failed to load classes. Please try again.");
        });
}

function displayClassCards(classes) {
    const container = document.getElementById('classCardsContainer');
    
    if (!classes || classes.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-book fa-3x text-muted mb-3"></i>
                <p class="text-muted">No classes assigned yet.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    
    // Group classes by subject_code, subject_name, school_year, and semester
    const groupedClasses = {};
    classes.forEach(cls => {
        // Use schoolyear from handle_subject table
        const schoolYear = cls.schoolyear || cls.school_year || '2024-2025';
        const semester = cls.semester || '1st';
        const key = `${cls.subject_code}-${cls.subject_name}-${schoolYear}-${semester}`;
        
        if (!groupedClasses[key]) {
            groupedClasses[key] = {
                subject_id: cls.subject_id,
                subject_code: cls.subject_code,
                subject_name: cls.subject_name,
                total_students: 0,
                sections: [],
                school_year: schoolYear,
                semester: semester
            };
        }
        groupedClasses[key].total_students += parseInt(cls.student_count) || 0;
        groupedClasses[key].sections.push(cls.sectionCode);
    });

    Object.values(groupedClasses).forEach(classData => {
        const semesterLabel = classData.semester === '1st' ? '1st Semester' : 
                             classData.semester === '2nd' ? '2nd Semester' : 
                             classData.semester === 'summer' ? 'Summer' : classData.semester;
        
        const card = `
            <div class="col-md-4 col-sm-6 mb-4">
                <div class="subject-card card h-100" data-year="${classData.school_year}" data-semester="${classData.semester}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <span class="student-count-badge">
                                <i class="fas fa-users me-1"></i> ${classData.total_students} Students
                            </span>
                        </div>
                        <h4 class="card-title mb-3">${classData.subject_code} - ${classData.subject_name}</h4>
                        <p class="text-muted small mb-2">
                            <i class="fas fa-calendar-alt me-1"></i> ${classData.school_year} - ${semesterLabel}
                        </p>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <span class="text-muted small">
                                <i class="fas fa-layer-group me-1"></i> ${classData.sections.length} Section(s)
                            </span>
                            <button class="btn btn-sm btn-outline-primary view-class-btn" onclick="showClassDetail(${classData.subject_id}, '${classData.subject_code} - ${classData.subject_name}', ${classData.total_students})">
                                <i class="fas fa-arrow-right"></i> View
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML += card;
    });
    
    // Apply current filters
    applyFilters();
}

function setSemesterFilter(semester) {
    const dropdownItems = document.querySelectorAll('#semesterFilterDropdown + .dropdown-menu .dropdown-item');
    dropdownItems.forEach(item => {
        item.classList.remove('active');
    });
    
    event.target.classList.add('active');
    currentSemesterFilter = semester;
    applyFilters();
}

function setYearFilter(year) {
    const dropdownItems = document.querySelectorAll('#schoolYearFilterDropdown + .dropdown-menu .dropdown-item');
    dropdownItems.forEach(item => {
        item.classList.remove('active');
    });
    
    event.target.classList.add('active');
    currentYearFilter = year;
    applyFilters();
}

function applyFilters() {
    const cards = document.querySelectorAll('.subject-card');
    const container = document.getElementById('classCardsContainer');
    let visibleCount = 0;
    
    const existingNoResults = container.querySelector('.no-results-message');
    if (existingNoResults) {
        existingNoResults.remove();
    }
    
    cards.forEach(card => {
        const cardYear = card.getAttribute('data-year');
        const cardSemester = card.getAttribute('data-semester');
        
        const yearMatch = currentYearFilter === 'all' || cardYear === currentYearFilter;
        const semesterMatch = currentSemesterFilter === 'all' || cardSemester === currentSemesterFilter;
        
        if (yearMatch && semesterMatch) {
            card.parentElement.style.display = '';
            visibleCount++;
        } else {
            card.parentElement.style.display = 'none';
        }
    });
    
    if (visibleCount === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'col-12 text-center py-5 no-results-message';
        noResults.innerHTML = `
            <i class="fas fa-book fa-3x text-muted mb-3"></i>
            <p class="text-muted">No classes found for the selected filters.</p>
        `;
        container.appendChild(noResults);
    }
}

function showClassDetail(subjectId, subjectName, studentCount) {
    currentSubjectId = subjectId;
    currentSubjectName = subjectName;
    gradesSubmitted = false;
    
    const classesView = document.getElementById('classes-list-view');
    const detailView = document.getElementById('class-detail-view');
    
    classesView.style.display = 'none';
    detailView.classList.add('active');
    
    document.getElementById('class-title').textContent = subjectName;
    document.getElementById('student-count').textContent = studentCount;
    
    loadSubjectUnit(subjectId);
    loadSections(subjectId);
    
    document.getElementById('searchInput').value = '';
    document.getElementById('searchInput').disabled = true;
    document.getElementById('schoolYearDisplay').value = '--';
    document.getElementById('noSectionMessage').style.display = 'block';
    document.getElementById('gradeTableContainer').style.display = 'none';
    
    updateExportButton();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function loadSubjectUnit(subjectId) {
    const link = `https://mseufportal.onrender.com/subject/${subjectId}`;
    
    fetch(link, { mode: "cors" })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((subject) => {
            if (subject && subject.unit) {
                currentSubjectUnit = subject.unit;
                document.getElementById('subject-unit').textContent = subject.unit;
            }
        })
        .catch((error) => {
            console.error("Error fetching subject unit:", error);
            currentSubjectUnit = 0;
            document.getElementById('subject-unit').textContent = '--';
        });
}

function loadSections(subjectId) {
    if (!loggedInUser || !loggedInUser.teacher_id) {
        return;
    }

    const teacherId = loggedInUser.teacher_id;
    const link = `https://mseufportal.onrender.com/teacher/subject/${subjectId}/sections/${teacherId}`;

    fetch(link, { mode: "cors" })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((sections) => {
            populateSections(sections);
        })
        .catch((error) => {
            console.error("Error fetching sections:", error);
            showError("Failed to load sections.");
        });
}

function populateSections(sections) {
    const sectionFilter = document.getElementById('sectionFilter');
    sectionFilter.innerHTML = '<option value="">-- Select Section --</option>';
    
    const uniqueSections = [];
    const seenSections = new Set();
    
    sections.forEach(section => {
        if (!seenSections.has(section.sectionCode)) {
            seenSections.add(section.sectionCode);
            uniqueSections.push(section);
        }
    });
    
    uniqueSections.forEach(section => {
        const option = document.createElement('option');
        option.value = section.sectionCode;
        option.textContent = section.sectionCode;
        option.setAttribute('data-year', section.year_level_name || '--');
        option.setAttribute('data-count', section.student_count || 0);
        sectionFilter.appendChild(option);
    });
}

function onSectionChange() {
    const sectionFilter = document.getElementById('sectionFilter');
    const schoolYearDisplay = document.getElementById('schoolYearDisplay');
    const searchInput = document.getElementById('searchInput');
    const noSectionMessage = document.getElementById('noSectionMessage');
    const gradeTableContainer = document.getElementById('gradeTableContainer');
    
    gradesSubmitted = false;
    
    if (sectionFilter.value) {
        currentSectionCode = sectionFilter.value;
        schoolYearDisplay.value = '1st Semester';
        searchInput.disabled = false;
        noSectionMessage.style.display = 'none';
        
        loadSectionGrades(currentSubjectId, currentSectionCode);
    } else {
        currentSectionCode = null;
        schoolYearDisplay.value = '--';
        searchInput.disabled = true;
        searchInput.value = '';
        noSectionMessage.style.display = 'block';
        gradeTableContainer.style.display = 'none';
    }
    
    updateExportButton();
}

function loadSectionGrades(subjectId, sectionCode) {
    if (!loggedInUser || !loggedInUser.teacher_id) {
        return;
    }

    const teacherId = loggedInUser.teacher_id;
    const link = `https://mseufportal.onrender.com/teacher/section-grades/${teacherId}/${subjectId}/${sectionCode}`;

    fetch(link, { mode: "cors" })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            const { students, encode, final_encode } = data;
            studentGrades = students;
            
            if (students && students.length > 0) {
                if (students[0].semester) {
                    currentSemester = students[0].semester;
                }
                if (students[0].schoolyear) {
                    currentSchoolYear = students[0].schoolyear;
                }
            }
            
            displayGradeTable(students, encode, final_encode);
        })
        .catch((error) => {
            console.error("Error fetching grades:", error);
            showError("Failed to load student grades.");
        });
}

function displayGradeTable(students, encode, final_encode) {
    const tbody = document.getElementById('gradeTableBody');
    const gradeTableContainer = document.getElementById('gradeTableContainer');
    
    const canEditMidterm = encode === 'on';
    const canEditFinal = final_encode === 'on';
    
    if (!students || students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    <i class="fas fa-users-slash fa-2x text-muted mb-2"></i>
                    <p class="text-muted mb-0">No students enrolled in this section.</p>
                </td>
            </tr>
        `;
        gradeTableContainer.style.display = 'block';
        return;
    }

    tbody.innerHTML = '';
    
    students.forEach(student => {
        const midtermGrade = student.midterm_grade || '';
        const finalGrade = student.final_grade;
        
        const studentCanEdit = student.encodeGrade === 'on';
        const canEditMidtermForStudent = canEditMidterm && studentCanEdit;
        const canEditFinalForStudent = canEditFinal && studentCanEdit;
        
        let selectedValue = '';
        let remarksText = 'Incomplete';
        let remarksClass = 'status-incomplete';
        
        if (finalGrade !== null && finalGrade !== undefined && finalGrade !== '') {
            const finalGradeStr = finalGrade.toString();
            
            if (finalGradeStr === '0' || finalGradeStr === '0.00' || finalGradeStr === '0.0') {
                selectedValue = '0';
                remarksText = 'Dropped';
                remarksClass = 'status-drop';
            } else if (finalGradeStr === '6.00' || finalGradeStr === '6' || finalGradeStr === 'INC') {
                selectedValue = '6.00';
                remarksText = 'Incomplete';
                remarksClass = 'status-incomplete';
            } else if (parseFloat(finalGradeStr) >= 5.00) {
                selectedValue = parseFloat(finalGradeStr).toFixed(2);
                remarksText = 'Failed';
                remarksClass = 'status-failed';
            } else if (!isNaN(parseFloat(finalGradeStr))) {
                selectedValue = parseFloat(finalGradeStr).toFixed(2);
                remarksText = 'Passed';
                remarksClass = 'status-passed';
            } else {
                selectedValue = finalGradeStr;
                remarksText = 'Incomplete';
                remarksClass = 'status-incomplete';
            }
        }
        
        let midtermPlaceholder = '0-100';
        
        if (!canEditMidterm) {
            midtermPlaceholder = 'Teacher encoding disabled';
        } else if (!studentCanEdit) {
            midtermPlaceholder = 'Student encoding disabled';
        }
        
        const row = `
            <tr data-student-id="${student.studentUser_id}" data-grade-id="${student.grade_id || ''}" data-encode-grade="${student.encodeGrade || 'off'}">
                <td class="student-id-cell">${student.student_id}</td>
                <td class="student-name-cell">${student.student_name}</td>
                <td>
                    <input type="number" 
                           class="form-control midterm-grade-input" 
                           value="${midtermGrade}" 
                           placeholder="${midtermPlaceholder}"
                           min="0" 
                           max="100"
                           step="1"
                           ${canEditMidtermForStudent ? '' : 'readonly'}
                           style="${canEditMidtermForStudent ? '' : 'background-color: #e9ecef; cursor: not-allowed;'}">
                </td>
                <td>
                    <select class="form-select final-grade" onchange="updateRemarks(this)" ${canEditFinalForStudent ? '' : 'disabled'} style="${canEditFinalForStudent ? '' : 'background-color: #e9ecef; cursor: not-allowed;'}">
                        <option value="">--</option>
                        <option value="1.00" ${selectedValue === '1.00' ? 'selected' : ''}>1.00</option>
                        <option value="1.25" ${selectedValue === '1.25' ? 'selected' : ''}>1.25</option>
                        <option value="1.50" ${selectedValue === '1.50' ? 'selected' : ''}>1.50</option>
                        <option value="1.75" ${selectedValue === '1.75' ? 'selected' : ''}>1.75</option>
                        <option value="2.00" ${selectedValue === '2.00' ? 'selected' : ''}>2.00</option>
                        <option value="2.25" ${selectedValue === '2.25' ? 'selected' : ''}>2.25</option>
                        <option value="2.50" ${selectedValue === '2.50' ? 'selected' : ''}>2.50</option>
                        <option value="2.75" ${selectedValue === '2.75' ? 'selected' : ''}>2.75</option>
                        <option value="3.00" ${selectedValue === '3.00' ? 'selected' : ''}>3.00</option>
                        <option value="5.00" ${selectedValue === '5.00' ? 'selected' : ''}>5.00</option>
                        <option value="6.00" ${selectedValue === '6.00' ? 'selected' : ''}>INC</option>
                        <option value="0" ${selectedValue === '0' ? 'selected' : ''}>0</option>
                    </select>
                </td>
                <td class="remarks-cell ${remarksClass}">${remarksText}</td>
            </tr>
        `;
        
        tbody.innerHTML += row;
    });
    
    gradeTableContainer.style.display = 'block';
    updateExportButton();
}

function updateRemarks(selectElement) {
    const row = selectElement.closest('tr');
    const remarksCell = row.querySelector('.remarks-cell');
    const gradeValue = selectElement.value;

    remarksCell.classList.remove('status-passed', 'status-failed', 'status-incomplete', 'status-drop');

    if (gradeValue === '' || gradeValue === '6.00') {
        remarksCell.textContent = 'Incomplete';
        remarksCell.classList.add('status-incomplete');
    } else if (gradeValue === '0') {
        remarksCell.textContent = 'Dropped';
        remarksCell.classList.add('status-drop');
    } else if (parseFloat(gradeValue) >= 5.00) {
        remarksCell.textContent = 'Failed';
        remarksCell.classList.add('status-failed');
    } else {
        remarksCell.textContent = 'Passed';
        remarksCell.classList.add('status-passed');
    }
}

function updateExportButton() {
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        if (gradesSubmitted) {
            exportBtn.disabled = false;
            exportBtn.style.cursor = 'pointer';
            exportBtn.style.opacity = '1';
        } else {
            exportBtn.disabled = true;
            exportBtn.style.cursor = 'not-allowed';
            exportBtn.style.opacity = '0.6';
        }
    }
}

function submitGrades() {
    if (!loggedInUser || !loggedInUser.teacher_id) {
        alert("Please log in to submit grades.");
        return;
    }

    const rows = document.querySelectorAll('#gradeTableBody tr');
    let hasEmpty = false;
    const gradesToSubmit = [];

    rows.forEach(row => {
        const studentId = row.getAttribute('data-student-id');
        const encodeGrade = row.getAttribute('data-encode-grade');
        const midtermInput = row.querySelector('.midterm-grade-input');
        const finalSelect = row.querySelector('.final-grade');
        
        if (encodeGrade === 'off') {
            return;
        }
        
        const midterm = midtermInput.value;
        const final = finalSelect.value;

        if (!midterm || midterm === "" || !final || final === "") {
            hasEmpty = true;
        } else {
            let finalGradeValue;
            if (final === '6.00') {
                finalGradeValue = 6.00;
            } else if (final === '0') {
                finalGradeValue = 0;
            } else {
                finalGradeValue = parseFloat(final);
            }

            gradesToSubmit.push({
                studentUser_id: parseInt(studentId),
                subject_id: currentSubjectId,
                teacher_id: loggedInUser.teacher_id,
                midterm_grade: parseInt(midterm),
                final_grade: finalGradeValue,
                academic_year: '2024-2025',
                semester: '1st'
            });
        }
    });

    if (gradesToSubmit.length === 0) {
        alert("No grades available to submit. All students have encoding disabled.");
        return;
    }

    if (hasEmpty) {
        if (!confirm("Some students have incomplete grades. Do you want to submit the grades anyway?")) {
            return;
        }
    }

    fetch('https://mseufportal.onrender.com/teacher/grades/bulk-update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grades: gradesToSubmit })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            gradesSubmitted = true;
            updateExportButton();
            alert(`Grades submitted successfully! ${data.successCount} grade(s) updated.`);
            setTimeout(() => {
                loadSectionGrades(currentSubjectId, currentSectionCode);
            }, 1000);
        } else {
            alert(`Some grades failed to update. ${data.successCount} grade(s) were successful.`);
        }
    })
    .catch(error => {
        console.error("Error submitting grades:", error);
        alert("Failed to submit grades. Please try again.");
    });
}

function exportGrades() {
    if (!gradesSubmitted) {
        alert("Please submit grades before exporting.");
        return;
    }
    
    if (!studentGrades || studentGrades.length === 0) {
        alert("No grades to export.");
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        // Date and time in top left
        doc.setFontSize(9);
        doc.text(`${dateStr} ${timeStr}`, 14, 15);
        
        // Header - School Name
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        const schoolName = 'MANUEL S. ENVERGA UNIVERSITY FOUNDATION';
        const schoolNameWidth = doc.getTextWidth(schoolName);
        doc.text(schoolName, (doc.internal.pageSize.width - schoolNameWidth) / 2, 20);
        
        doc.setFontSize(12);
        const subtitle = 'CANDELARIA INC.';
        const subtitleWidth = doc.getTextWidth(subtitle);
        doc.text(subtitle, (doc.internal.pageSize.width - subtitleWidth) / 2, 26);
        
        
        // Horizontal line
        doc.setLineWidth(0.5);
        doc.line(14, 36, doc.internal.pageSize.width - 14, 36);
        
        // Left column information
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        let yPos = 45;
        
        const subjectCode = currentSubjectName.split(' - ')[0];
        const subjectNameOnly = currentSubjectName.split(' - ')[1] || currentSubjectName;
        
        doc.setFont(undefined, 'bold');
        doc.text('Subject:', 14, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(`${subjectCode} - ${subjectNameOnly}`, 40, yPos);
        
        yPos += 6;
        doc.setFont(undefined, 'bold');
        doc.text('Section:', 14, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(currentSectionCode, 40, yPos);
        
        yPos += 6;
        doc.setFont(undefined, 'bold');
        doc.text('Teacher:', 14, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(teacherName || 'N/A', 40, yPos);
        
        // Right column information
        const rightX = 120;
        yPos = 45;
        
        doc.setFont(undefined, 'bold');
        doc.text('Unit:', rightX, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(String(currentSubjectUnit || 'N/A'), rightX + 20, yPos);
        
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
        const sortedStudents = [...studentGrades].sort((a, b) => {
            const nameA = a.student_name || '';
            const nameB = b.student_name || '';
            const lastNameA = nameA.split(' ').pop().toLowerCase();
            const lastNameB = nameB.split(' ').pop().toLowerCase();
            return lastNameA.localeCompare(lastNameB);
        });
        
        // Table headers - Include both midterm and final
        const tableHeaders = ['No.', 'Student ID', 'Student Name', 'Midterm Grade', 'Final Grade', 'Remarks'];
        
        const tableData = sortedStudents.map((student, index) => {
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
            
            // Midterm grade
            const midtermGrade = student.midterm_grade !== null ? Math.round(student.midterm_grade) : '-';
            
            // Final grade
            const finalGrade = student.final_grade !== null ? student.final_grade : '-';
            
            // Remarks based on final grade
            let remarks = '-';
            if (student.final_grade !== null) {
                const finalGradeNum = parseFloat(student.final_grade);
                if (finalGradeNum >= 1.00 && finalGradeNum <= 3.00) {
                    remarks = 'Passed';
                } else if (finalGradeNum === 0 || finalGradeNum === 0.00) {
                    remarks = 'Dropped';
                } else if (finalGradeNum === 5.00) {
                    remarks = 'Failed';
                } else if (finalGradeNum === 6.00) {
                    remarks = 'Incomplete';
                }
            }
            
            return [index + 1, studentId, formattedName, midtermGrade, finalGrade, remarks];
        });
        
        // Create table
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
                0: { halign: 'center', cellWidth: 15 },  // No.
                1: { halign: 'center', cellWidth: 25 },  // Student ID
                2: { halign: 'left', cellWidth: 60 },    // Student Name
                3: { halign: 'center', cellWidth: 25 },  // Midterm
                4: { halign: 'center', cellWidth: 25 },  // Final
                5: { halign: 'center', cellWidth: 25 }   // Remarks
            }
        });
        
        // Footer with Instructor and Dean
        const footerY = doc.internal.pageSize.height - 20;
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        const instructorLabel = 'Instructor: ';
        const instructorLabelWidth = doc.getTextWidth(instructorLabel);
        doc.text(instructorLabel, 14, footerY);
        
        doc.setFont(undefined, 'normal');
        doc.text(teacherName || 'N/A', 14 + instructorLabelWidth, footerY);
        
        const deanX = doc.internal.pageSize.width / 2 + 20;
        doc.setFont(undefined, 'bold');
        const deanLabel = 'Dean: ';
        const deanLabelWidth = doc.getTextWidth(deanLabel);
        doc.text(deanLabel, deanX, footerY);
        
        doc.setFont(undefined, 'normal');
        const deanName = 'Dr. Maria Santos';  // Replace with actual dean name
        doc.text(deanName, deanX + deanLabelWidth, footerY);
        
        const fileName = `${subjectCode}_${currentSectionCode}_grades_${dateStr.replace(/\s+/g, '_')}.pdf`;
        doc.save(fileName);
        
    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Error exporting PDF. Please try again.');
    }
}

function backToClasses() {
    const classesView = document.getElementById('classes-list-view');
    const detailView = document.getElementById('class-detail-view');
    
    detailView.classList.remove('active');
    classesView.style.display = 'block';
    
    currentSubjectId = null;
    currentSubjectName = null;
    currentSectionCode = null;
    studentGrades = [];
    currentSubjectUnit = 0;
    gradesSubmitted = false;
    
    document.getElementById('sectionFilter').innerHTML = '<option value="">-- Select Section --</option>';
    document.getElementById('schoolYearDisplay').value = '--';
    document.getElementById('searchInput').value = '';
    document.getElementById('searchInput').disabled = true;
    document.getElementById('subject-unit').textContent = '--';
    document.getElementById('noSectionMessage').style.display = 'block';
    document.getElementById('gradeTableContainer').style.display = 'none';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterStudents() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const tbody = document.getElementById('gradeTableBody');
    const rows = tbody.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const idCell = rows[i].getElementsByClassName('student-id-cell')[0];
        const nameCell = rows[i].getElementsByClassName('student-name-cell')[0];
        
        if (idCell && nameCell) {
            const id = idCell.textContent.toLowerCase();
            const name = nameCell.textContent.toLowerCase();
            
            if (id.includes(searchQuery) || name.includes(searchQuery)) {
                rows[i].style.display = '';
            } else {
                rows[i].style.display = 'none';
            }
        }
    }
}

function showError(message) {
    const container = document.getElementById('classCardsContainer');
    container.innerHTML = `
        <div class="col-12">
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
            </div>
        </div>
    `;
}

// Global function exports
window.showClassDetail = showClassDetail;
window.backToClasses = backToClasses;
window.setSemesterFilter = setSemesterFilter;
window.setYearFilter = setYearFilter;
window.onSectionChange = onSectionChange;
window.updateRemarks = updateRemarks;
window.submitGrades = submitGrades;
window.exportGrades = exportGrades;
window.filterStudents = filterStudents;