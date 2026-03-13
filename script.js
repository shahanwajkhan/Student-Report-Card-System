/**
 * EduFlow | Student Report Card System
 * Core Logic and State Management
 */

// --- Global State ---
const students = JSON.parse(localStorage.getItem('eduflow_students') || '[]');
let currentUser = null;
const subjects = ['Mathematics', 'Science', 'English', 'History', 'Computer'];

// --- Advanced Teacher Data ---
const assignments = JSON.parse(localStorage.getItem('eduflow_assignments') || '[]');
const notifications = JSON.parse(localStorage.getItem('eduflow_notifications') || '[]');

if (assignments.length === 0) {
    assignments.push(
        { id: 'a1', title: 'Calculus Quiz', type: 'quiz', date: '2025-03-20', total: 50, submissions: 12, totalStudents: 25 },
        { id: 'a2', title: 'Biology Lab Report', type: 'assignment', date: '2025-03-22', total: 100, submissions: 8, totalStudents: 25 },
        { id: 'a3', title: 'History Term Test', type: 'test', date: '2025-03-25', total: 100, submissions: 0, totalStudents: 25 }
    );
    localStorage.setItem('eduflow_assignments', JSON.stringify(assignments));
}

if (notifications.length === 0) {
    notifications.push(
        { id: 'n1', title: 'Pending Marks Entry', desc: 'Roll numbers #102 and #105 marks are missing for History.', type: 'task', time: '2h ago' },
        { id: 'n2', title: 'Low Attendance Alert', desc: '3 students in Class A have attendance below 75%.', type: 'alert', time: '5h ago' }
    );
    localStorage.setItem('eduflow_notifications', JSON.stringify(notifications));
}

// --- initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    loadData();
    initApp();
    initLandingAnimations();
    initNavbarScroll();
    initMobileMenu();
    renderLogs();
    renderAttendanceView();
});

// --- Mobile Menu Management ---
function initMobileMenu() {
    const toggle = document.getElementById('mobileMenuToggle');
    const mobileNav = document.getElementById('mobileNav');
    
    if (toggle && mobileNav) {
        toggle.onclick = (e) => {
            e.stopPropagation();
            mobileNav.classList.toggle('active');
            const icon = toggle.querySelector('i');
            if (mobileNav.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-times');
            } else {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        };

        // Close menu on click outside
        document.addEventListener('click', (e) => {
            if (mobileNav.classList.contains('active') && !mobileNav.contains(e.target) && e.target !== toggle) {
                mobileNav.classList.remove('active');
                toggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
            }
        });
    }
}

window.toggleMobileMenu = () => {
    const mobileNav = document.getElementById('mobileNav');
    const toggle = document.getElementById('mobileMenuToggle');
    if (mobileNav && toggle) {
        mobileNav.classList.remove('active');
        toggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
    }
};

// --- UI Enhancements ---
function initNavbarScroll() {
    const nav = document.querySelector('.landing-nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

// --- Authentication Manager ---
function initAuth() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const toSignup = document.getElementById('toSignup');
    const toLogin = document.getElementById('toLogin');
    const logoutBtn = document.getElementById('logoutBtn');
    const authGate = document.getElementById('authGate');

    // Close Auth Gate on click outside
    authGate.onclick = (e) => {
        if (e.target === authGate) {
            authGate.classList.remove('active');
        }
    };

    // Toggle Forms
    toSignup.onclick = () => {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        document.getElementById('authTitle').innerText = "Create Account";
        document.getElementById('authSubtitle').innerText = "Join the future of education management.";
    };

    toLogin.onclick = () => {
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        document.getElementById('authTitle').innerText = "Welcome Back";
        document.getElementById('authSubtitle').innerText = "Please sign in to continue.";
    };

    // Form Submissions
    loginForm.onsubmit = handleLogin;
    signupForm.onsubmit = handleSignup;
    logoutBtn.onclick = handleLogout;

    // Check existing session
    const savedSession = localStorage.getItem('eduflow_session');
    if (savedSession) {
        currentUser = JSON.parse(savedSession);
        enterApp();
    }
}

function openAuth(mode) {
    const authGate = document.getElementById('authGate');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    authGate.classList.add('active');
    if (mode === 'signup') {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        document.getElementById('authTitle').innerText = "Create Account";
        document.getElementById('authSubtitle').innerText = "Join the future of education management.";
    } else {
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        document.getElementById('authTitle').innerText = "Welcome Back";
        document.getElementById('authSubtitle').innerText = "Please sign in to continue.";
    }
}

function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('loginUsername').value;
    const pass = document.getElementById('loginPassword').value;

    const users = JSON.parse(localStorage.getItem('eduflow_users') || '[]');
    const found = users.find(u => u.username === user && u.password === pass);

    if (found) {
        currentUser = found;
        localStorage.setItem('eduflow_session', JSON.stringify(found));
        enterApp();
    } else {
        alert('Invalid credentials! Please check your username and password.');
    }
}

function enterApp() {
    document.getElementById('authGate').classList.remove('active');
    document.getElementById('landingPage').classList.remove('active');
    document.getElementById('landingPage').classList.add('hidden');
    document.querySelector('.app-container').classList.remove('hidden');
    let displayName = currentUser.username;
    if (displayName.toLowerCase() === 'testadmin') {
        displayName = 'Test Admin';
    } else {
        displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    }
    document.getElementById('welcomeName').innerText = displayName;
    document.body.classList.add('app-active');
    updateUserUI();
    renderAll();
}

function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const role = document.getElementById('signupRole').value;

    const users = JSON.parse(localStorage.getItem('eduflow_users') || '[]');
    if (users.find(u => u.username === username)) {
        alert('Username already exists!');
        return;
    }

    const newUser = { 
        username, 
        email, 
        password, 
        role,
        subject: null
    };
    users.push(newUser);
    localStorage.setItem('eduflow_users', JSON.stringify(users));

    alert('Registration successful! Please login.');
    document.getElementById('toLogin').click();
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        localStorage.removeItem('eduflow_session');
        document.getElementById('landingPage').classList.remove('hidden');
        document.querySelector('.app-container').classList.add('hidden');
        document.body.classList.remove('app-active', 'role-admin');
    }
}

function updateUserUI() {
    if (!currentUser) return;
    
    document.getElementById('sideUserName').innerText = currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1);
    document.getElementById('sideUserRole').innerText = currentUser.role;
    const badge = document.getElementById('sideSubjectBadge');
    badge.style.display = 'none';

    // Update dropdown
    document.getElementById('dropdownName').innerText = currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1);
    document.getElementById('dropdownRole').innerText = currentUser.role;
    
    // Update profile images
    const avatarUrl = `https://ui-avatars.com/api/?name=${currentUser.username}&background=7c5cff&color=fff`;
    const dropdownTrigger = document.getElementById('profileTrigger');
    if (dropdownTrigger) dropdownTrigger.src = avatarUrl;
    
    if (currentUser.role === 'Admin') {
        document.getElementById('sideUserAvatar').innerText = 'A';
    } else {
        document.getElementById('sideUserAvatar').innerText = currentUser.username.charAt(0).toUpperCase();
    }

    // Role-based classes on body (Defaulting to admin)
    document.body.classList.remove('role-admin', 'role-teacher', 'role-student');
    document.body.classList.add('role-admin');

    // Show all administrative elements
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = '';
    });

    logActivity(`Login: ${currentUser.username} (${currentUser.role})`);
    
    // Initial data renders
    renderNotifications();
    renderAssignments();
}


// --- Notification & Dropdown Management ---
function initDropdowns() {
    const pTrigger = document.getElementById('profileTrigger');
    const pMenu = document.getElementById('profileDropdown');
    const nTrigger = document.getElementById('notifTrigger');
    const nMenu = document.getElementById('notifDropdown');
    const logoutAction = document.getElementById('dropdownLogout');

    // Profile Dropdown
    if (pTrigger && pMenu) {
        pTrigger.onclick = (e) => {
            e.stopPropagation();
            if (nMenu) nMenu.classList.remove('show');
            pMenu.classList.toggle('show');
        };
    }

    // Notification Dropdown
    if (nTrigger && nMenu) {
        nTrigger.onclick = (e) => {
            e.stopPropagation();
            if (pMenu) pMenu.classList.remove('show');
            nMenu.classList.toggle('show');
            renderNotifications(); // Refresh on open
        };
    }

    window.onclick = () => {
        if (pMenu) pMenu.classList.remove('show');
        if (nMenu) nMenu.classList.remove('show');
    };

    if (logoutAction) {
        logoutAction.onclick = (e) => {
            e.preventDefault();
            handleLogout();
        };
    }
}

function renderNotifications() {
    const list = document.getElementById('notifList');
    const badge = document.getElementById('notifBadge');
    if (!list) return;

    if (notifications.length === 0) {
        list.innerHTML = '<div style="padding: 2rem; text-align: center; color: #94a3b8; font-size:0.85rem">All caught up!</div>';
        if (badge) badge.style.display = 'none';
        return;
    }

    if (badge) badge.style.display = 'block';
    list.innerHTML = notifications.map(n => `
        <div class="notif-item">
            <div class="notif-icon-circle">
                <i class="fas ${n.type === 'task' ? 'fa-clipboard-list' : 'fa-exclamation-circle'}"></i>
            </div>
            <div class="notif-content">
                <strong>${n.title}</strong>
                <p>${n.desc}</p>
                <span>${n.time}</span>
            </div>
        </div>
    `).join('');
}

// --- Assignment Management ---
function renderAssignments() {
    const grid = document.getElementById('assignmentGrid');
    if (!grid) return;

    grid.innerHTML = assignments.map(a => {
        const percent = Math.round((a.submissions / a.totalStudents) * 100);
        return `
            <div class="assignment-card">
                <div class="assignment-header">
                    <span class="assignment-type type-${a.type}">${a.type}</span>
                    <button class="btn-icon"><i class="fas fa-ellipsis-v"></i></button>
                </div>
                <div class="assignment-title">${a.title}</div>
                <div class="assignment-meta">
                    <div class="meta-item"><i class="far fa-calendar"></i> Due: ${a.date}</div>
                    <div class="meta-item"><i class="fas fa-bullseye"></i> Max Marks: ${a.total}</div>
                </div>
                <div class="assignment-progress">
                    <div class="progress-header">
                        <span>Submissions</span>
                        <span>${percent}% (${a.submissions}/${a.totalStudents})</span>
                    </div>
                    <div class="progress-bar-sm">
                        <div class="progress-fill" style="width: ${percent}%"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// --- Activity Logging ---
function logActivity(action) {
    const logs = JSON.parse(localStorage.getItem('eduflow_logs') || '[]');
    const newLog = {
        id: Date.now(),
        user: currentUser ? currentUser.username : 'System',
        action,
        timestamp: new Date().toLocaleString()
    };
    logs.unshift(newLog);
    if (logs.length > 50) logs.pop();
    localStorage.setItem('eduflow_logs', JSON.stringify(logs));
    renderLogs();
}

function renderLogs() {
    const logList = document.getElementById('activityLogList');
    if (!logList) return;
    const logs = JSON.parse(localStorage.getItem('eduflow_logs') || '[]');
    logList.innerHTML = logs.map(l => `
        <div class="log-item">
            <span class="log-time">${l.timestamp}</span>
            <span class="log-user"><strong>${l.user}</strong></span>
            <span class="log-action">${l.action}</span>
        </div>
    `).join('');
}

window.clearLogs = () => {
    localStorage.removeItem('eduflow_logs');
    renderLogs();
};


// --- App Initialization ---
function initApp() {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = item.getAttribute('data-view');
            switchView(viewId);
            
            // Auto-close sidebar on mobile
            if (window.innerWidth <= 768) {
                document.querySelector('.sidebar').classList.remove('active');
            }
        });
    });

    // Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.onclick = () => {
            document.querySelector('.sidebar').classList.toggle('active');
        };
    }

    // Modals
    const openAddBtn = document.getElementById('openAddModal');
    if (openAddBtn) openAddBtn.onclick = () => openModal();

    // Forms
    document.getElementById('studentForm').addEventListener('submit', handleStudentSubmit);
    document.getElementById('marksForm').addEventListener('submit', handleMarksSubmit);

    // Modals
    document.getElementById('exportData').onclick = exportData;
    document.getElementById('importFile').onchange = importData;

    // Marks View Student Selection
    document.getElementById('studentSelect').addEventListener('change', (e) => {
        updateSelectedStudentInfo(e.target.value);
    });

    // Bulk Entry Subject Change
    const bulkSub = document.getElementById('bulkSubjectSelect');
    if (bulkSub) {
        bulkSub.addEventListener('change', renderBulkTable);
    }

    // Export Button
    const expBtn = document.getElementById('exportData');
    if (expBtn) {
        expBtn.onclick = exportToCSV;
    }

    initDropdowns();
    renderAll();
}

// --- Bulk Marks Entry ---
window.toggleBulkMode = () => {
    const std = document.getElementById('standardEntryMode');
    const bulk = document.getElementById('bulkEntryMode');
    if (!std || !bulk) return;

    if (bulk.classList.contains('hidden')) {
        std.classList.add('hidden');
        bulk.classList.remove('hidden');
        renderBulkTable();
    } else {
        bulk.classList.add('hidden');
        std.classList.remove('hidden');
    }
}

function renderBulkTable() {
    const tbody = document.getElementById('bulkTableBody');
    const subject = document.getElementById('bulkSubjectSelect').value;
    if (!tbody) return;

    tbody.innerHTML = students.map(s => `
        <tr>
            <td>${s.roll}</td>
            <td><strong>${s.name}</strong></td>
            <td>
                <input type="number" class="form-control bulk-input" 
                       data-student-id="${s.id}" 
                       value="${s.marks[subject] || 0}" 
                       min="0" max="100" style="width: 100px">
            </td>
            <td><span class="badge-pill" style="background:#f1f5f9; color:#475569">Editing</span></td>
        </tr>
    `).join('');
}

window.saveBulkMarks = () => {
    const subject = document.getElementById('bulkSubjectSelect').value;
    const inputs = document.querySelectorAll('.bulk-input');
    
    inputs.forEach(input => {
        const id = input.getAttribute('data-student-id');
        const marks = parseInt(input.value) || 0;
        const s = students.find(st => st.id === id);
        if (s) {
            s.marks[subject] = marks;
            recalculateStudent(s);
        }
    });

    localStorage.setItem('eduflow_students', JSON.stringify(students));
    renderAll();
    alert(`Bulk marks saved successfully for ${subject}.`);
    toggleBulkMode();
};

function recalculateStudent(s) {
    const marksArr = Object.values(s.marks);
    s.total = marksArr.reduce((a, b) => a + b, 0);
    s.percentage = s.total / subjects.length;
    s.grade = calculateGrade(s.percentage);
}

// --- Data Export ---
window.exportToCSV = () => {
    if (students.length === 0) {
        alert("No student data available to export.");
        return;
    }

    const headers = ['Roll', 'Name', 'Class', ...subjects, 'Total', 'Percentage', 'Grade'];
    const rows = students.map(s => [
        s.roll,
        s.name,
        s.classSection,
        ...subjects.map(sub => s.marks[sub] || 0),
        s.total,
        s.percentage.toFixed(2),
        s.grade
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_academic_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// --- View Navigation ---
window.switchView = (viewId) => {
    // Update breadcrumb
    const breadcrumbMap = {
        'dashboard': 'Overview',
        'students': 'Student Registry',
        'entry': 'Marks Entry',
        'analysis': 'Academic Analysis',
        'attendance': 'Attendance Registry',
        'assignments': 'Assignments & Quizzes',
        'studentDashboard': 'Student Profile',
        'myResults': 'Academic Results',
        'studyMaterials': 'Study Hub',
        'logs': 'System Logs'
    };
    
    if (breadcrumbMap[viewId]) {
        document.getElementById('breadcrumbCurrent').innerText = breadcrumbMap[viewId];
    }

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(`${viewId}View`).classList.add('active');
    document.querySelector(`.nav-item[data-view="${viewId}"]`).classList.add('active');
}

// --- Data Operations ---
function handleStudentSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('studentId').value;
    const name = document.getElementById('studentName').value;
    const roll = document.getElementById('rollNumber').value;
    const cls = document.getElementById('classSection').value;

    if (id) {
        // Update
        const index = students.findIndex(s => s.id === id);
        students[index] = { ...students[index], name, roll, classSection: cls };
    } else {
        // Add
        const newStudent = {
            id: Date.now().toString(),
            name,
            roll,
            classSection: cls,
            marks: { math: 0, science: 0, english: 0, history: 0, computer: 0 },
            total: 0,
            percentage: 0,
            grade: 'F'
        };
        students.push(newStudent);
    }

    saveData();
    closeModal();
    logActivity(`Registered new student: ${name} (Roll: ${roll})`);
    renderAll();
}

function handleMarksSubmit(e) {
    e.preventDefault();
    const studentId = document.getElementById('studentSelect').value;
    if (!studentId) {
        alert('Please select a student first!');
        return;
    }

    const studentIndex = students.findIndex(s => s.id === studentId);
    const marks = {
        math: parseFloat(document.getElementById('mathMarks').value) || 0,
        science: parseFloat(document.getElementById('scienceMarks').value) || 0,
        english: parseFloat(document.getElementById('englishMarks').value) || 0,
        history: parseFloat(document.getElementById('historyMarks').value) || 0,
        computer: parseFloat(document.getElementById('computerMarks').value) || 0
    };

    // Calculations
    const total = Object.values(marks).reduce((a, b) => a + b, 0);
    const percentage = (total / 500) * 100;
    const grade = calculateGrade(percentage);
    const notes = document.getElementById('teacherNotes').value;

    students[studentIndex] = {
        ...students[studentIndex],
        marks,
        total,
        percentage,
        grade,
        notes
    };

    saveData();
    logActivity(`Updated marks & notes for ${students[studentIndex].name}`);
    alert('Academic records updated successfully!');
    renderAll();
}

function calculateGrade(p) {
    if (p >= 90) return 'A+';
    if (p >= 80) return 'A';
    if (p >= 70) return 'B';
    if (p >= 60) return 'C';
    if (p >= 50) return 'D';
    if (p >= 40) return 'E';
    return 'F';
}

function deleteStudent(id) {
    // Protection: Teacher cannot delete
    if (currentUser?.role !== 'Admin') {
        alert('Permission Denied! Only Administrators can delete records.');
        return;
    }

    if (confirm('Are you sure you want to delete this student record?')) {
        students = students.filter(s => s.id !== id);
        saveData();
        renderAll();
    }
}

// --- Rendering Logic ---
function renderAll() {
    renderDashboard();
    renderStudentTable();
    updateStudentDropdown();
    renderAnalysis();
    updateTopper();
    renderRankTable();
    renderAttendanceView();
}

function renderDashboard() {
    const total = students.length;
    const passCount = students.filter(s => s.percentage >= 40).length;
    const passRate = total === 0 ? 0 : Math.round((passCount / total) * 100);

    const countTotal = document.getElementById('countTotal');
    const countPass = document.getElementById('countPass');
    if (countTotal) countTotal.innerText = total;
    if (countPass) countPass.innerText = passRate + '%';

    // Update Class Overview Metrics if they exist
    const classAvgEl = document.getElementById('classAvg');
    if (classAvgEl) {
        const percentages = students.map(s => s.percentage);
        const avg = total === 0 ? 0 : (percentages.reduce((a, b) => a + b, 0) / total).toFixed(1);
        const high = total === 0 ? 0 : Math.max(...percentages).toFixed(1);
        const low = total === 0 ? 0 : Math.min(...percentages).toFixed(1);

        classAvgEl.innerText = `${avg}%`;
        document.getElementById('classHigh').innerText = `${high}%`;
        document.getElementById('classLow').innerText = `${low}%`;
        document.getElementById('classPass').innerText = `${passRate}%`;
    }

    const recentList = document.getElementById('recentStudents');
    if (!recentList) return;

    if (students.length === 0) {
        recentList.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:2rem; color:#94a3b8;">Add your first student to get started!</td></tr>';
        return;
    }

    const recent = [...students].reverse().slice(0, 5);
    recentList.innerHTML = recent.map(s => `
        <tr>
            <td>
                <div style="font-weight: 600; color: #1e293b;">${s.name}</div>
            </td>
            <td>${s.roll}</td>
            <td><span class="badge-pill" style="background:#f1f5f9; color:#475569; font-size:0.75rem">${s.classSection}</span></td>
            <td style="color: #64748b; font-size: 0.85rem;">Just Now</td>
        </tr>
    `).join('');
}

function renderStudentTable(data = students) {
    const tbody = document.getElementById('studentTableBody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">No student records found.</td></tr>';
        return;
    }

    const isAdmin = currentUser?.role === 'Admin';

    tbody.innerHTML = data.map(s => `
        <tr>
            <td>${s.roll}</td>
            <td><strong>${s.name}</strong></td>
            <td>${s.classSection}</td>
            <td>${s.percentage.toFixed(1)}%</td>
            <td><span class="grade-pill grade-${s.grade[0]}">${s.grade}</span></td>
            <td>
                <div class="action-btns">
                    <button onclick="viewReport('${s.id}')" class="btn-icon" title="View Report"><i class="fas fa-file-invoice"></i></button>
                    <button onclick="editStudent('${s.id}')" class="btn-icon" title="Edit Info"><i class="fas fa-edit"></i></button>
                    ${isAdmin ? `
                    <button onclick="deleteStudent('${s.id}')" class="btn-icon text-danger" title="Delete"><i class="fas fa-trash"></i></button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function updateStudentDropdown() {
    const select = document.getElementById('studentSelect');
    if (!select) return;
    const currentValue = select.value;
    select.innerHTML = '<option value="">Choose a student...</option>' + 
        students.map(s => `<option value="${s.id}">${s.name} (Roll: ${s.roll})</option>`).join('');
    select.value = currentValue;
}

function updateSelectedStudentInfo(id) {
    const infoDiv = document.getElementById('selectedStudentInfo');
    const form = document.getElementById('marksForm');
    
    if (!id) {
        if (infoDiv) infoDiv.innerHTML = '';
        if (form) form.reset();
        return;
    }

    const s = students.find(st => st.id === id);
    if (infoDiv) {
        infoDiv.innerHTML = `
            <div class="student-profile-mini">
                <div class="avatar">${s.name[0]}</div>
                <div class="details">
                    <h4>${s.name}</h4>
                    <p>Grade: ${s.classSection} | Status: ${s.percentage >= 40 ? 'Passing' : 'Critical'}</p>
                </div>
            </div>
        `;
    }

    // Fill current marks
    document.getElementById('mathMarks').value = s.marks.math || 0;
    document.getElementById('scienceMarks').value = s.marks.science || 0;
    document.getElementById('englishMarks').value = s.marks.english || 0;
    document.getElementById('historyMarks').value = s.marks.history || 0;
    document.getElementById('computerMarks').value = s.marks.computer || 0;
    document.getElementById('teacherNotes').value = s.notes || '';
}

function updateTopper() {
    const topperDisp = document.getElementById('topperDisplay');
    const badgeName = document.getElementById('topperName');
    
    if (!topperDisp) return;

    if (students.length === 0) {
        topperDisp.innerHTML = '<p class="placeholder-text">No student records available.</p>';
        if (badgeName) badgeName.innerText = 'No Data';
        return;
    }

    const topper = [...students].sort((a, b) => b.percentage - a.percentage)[0];
    
    if (badgeName) badgeName.innerText = topper.name;
    topperDisp.innerHTML = `
        <div class="topper-hero">
            <div class="cup-icon"><i class="fas fa-award"></i></div>
            <div class="topper-info">
                <h4>${topper.name}</h4>
                <span>Roll Number: ${topper.roll}</span>
                <div class="score-badge">${topper.percentage.toFixed(2)}%</div>
            </div>
        </div>
    `;
}

function renderAnalysis() {
    const list = document.getElementById('subjectPerformanceList');
    if (!list) return;

    if (students.length === 0) {
        list.innerHTML = '<p class="placeholder-text">Not enough data for analysis.</p>';
        return;
    }

    const averages = {};
    subjects.forEach(sub => {
        const sum = students.reduce((acc, s) => acc + (s.marks[sub] || 0), 0);
        averages[sub] = Math.round(sum / students.length);
    });

    list.innerHTML = Object.entries(averages).map(([sub, avg]) => `
        <div class="subject-bar-container">
            <div class="bar-label">
                <span class="capitalize">${sub}</span>
                <span>${avg}/100</span>
            </div>
            <div class="bar-bg">
                <div class="bar-fill" style="width: ${avg}%"></div>
            </div>
        </div>
    `).join('');

    // Grade Distribution
    const dist = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0 };
    students.forEach(s => dist[s.grade]++);

    const gradeStats = document.getElementById('gradeStats');
    if (gradeStats) {
        gradeStats.innerHTML = Object.entries(dist)
            .filter(([_, count]) => count > 0)
            .map(([grade, count]) => `
                <div class="grade-pill-stat">
                    <span class="grade-pill grade-${grade[0]}">${grade}</span>
                    <span class="count">${count} Students</span>
                </div>
            `).join('');
    }
}

// --- Search & Filter ---
function handleSearch(e) {
    const term = e.target.value.toLowerCase();
    const filtered = students.filter(s => 
        s.name.toLowerCase().includes(term) || 
        s.roll.toString().includes(term)
    );
    renderStudentTable(filtered);
}

// --- Report Card View ---
window.viewReport = (id) => {
    const s = students.find(st => st.id === id);
    if (!s) return;
    const modal = document.getElementById('reportCardModal');
    const content = document.getElementById('reportCardContent');

    const requiresRemedial = s.percentage < 40;

    content.innerHTML = `
        <div class="report-card-paper">
            <div class="report-header">
                <div class="school-label">
                    <h2>EDUFLOW ACADEMIC RECORD</h2>
                    <p>Session 2025-26 | Terminal Examination</p>
                </div>
                <div style="text-align: right">
                    <img src="https://ui-avatars.com/api/?name=EF&background=1e293b&color=fff&size=64" alt="Seal" style="border-radius: 8px">
                </div>
            </div>

            <div class="report-meta">
                <div class="meta-group">
                    <label>Student Name</label>
                    <p>${s.name.charAt(0).toUpperCase() + s.name.slice(1)}</p>
                </div>
                <div class="meta-group">
                    <label>Roll Number</label>
                    <p>#${s.roll}</p>
                </div>
                <div class="meta-group">
                    <label>Class/Section</label>
                    <p>${s.classSection}</p>
                </div>
            </div>

            <table class="report-table">
                <thead>
                    <tr>
                        <th style="text-align: left">Subject Name</th>
                        <th style="text-align: center">Max Marks</th>
                        <th style="text-align: center">Obtained</th>
                        <th style="text-align: center">Grade</th>
                    </tr>
                </thead>
                <tbody>
                    ${subjects.map(sub => `
                        <tr>
                            <td class="capitalize">${sub}</td>
                            <td style="text-align: center">100</td>
                            <td style="text-align: center; font-weight: 700">${s.marks[sub]}</td>
                            <td style="text-align: center">
                                <span class="badge-pill grade-${calculateGrade(s.marks[sub])[0]}">${calculateGrade(s.marks[sub])}</span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2">TOTAL ACADEMIC PERFORMANCE</td>
                        <td colspan="2" style="text-align: right; font-size: 1.1rem">
                            ${s.total} / 500 <span style="color: #64748b; font-weight: 500; margin-left: 0.5rem">(${s.percentage.toFixed(2)}%)</span>
                        </td>
                    </tr>
                </tfoot>
            </table>

            <div class="report-footer">
                <div class="remarks-section" style="flex: 1">
                    <div class="teacher-remarks">
                        <strong>TEACHER REMARKS:</strong>
                        <p>${s.notes || "Satisfactory academic progress observed. Keep up the consistent effort."}</p>
                    </div>
                    <div class="remedial-box ${requiresRemedial ? 'required' : 'not-required'}">
                        <i class="fas ${requiresRemedial ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i>
                        ${requiresRemedial ? 'Requires Remedial Support' : 'Progressing Satisfactorily'}
                    </div>
                </div>

                <div class="grade-display-box">
                    <label>Final Grade</label>
                    <div class="grade-badge-seal grade-${s.grade[0]}">${s.grade}</div>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
};

// --- Modal Controls ---
window.closeReport = () => {
    document.getElementById('reportCardModal').classList.remove('active');
};

function openModal(id = null) {
    const modal = document.getElementById('studentModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('studentForm');
    
    if (id) {
        const s = students.find(st => st.id === id);
        title.innerText = 'Edit Student Record';
        document.getElementById('studentId').value = s.id;
        document.getElementById('studentName').value = s.name;
        document.getElementById('rollNumber').value = s.roll;
        document.getElementById('classSection').value = s.classSection;
    } else {
        title.innerText = 'Add Student Record';
        form.reset();
        document.getElementById('studentId').value = '';
    }
    
    modal.classList.add('active');
}

window.editStudent = (id) => openModal(id);
window.closeModal = () => {
    document.getElementById('studentModal').classList.remove('active');
};

// --- Password Toggle ---
window.togglePassword = (id) => {
    const input = document.getElementById(id);
    const icon = input.nextElementSibling;
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
};

// --- Persistence ---
function saveData() {
    localStorage.setItem('eduflow_students', JSON.stringify(students));
}

function loadData() {
    const data = localStorage.getItem('eduflow_students');
    if (data) students = JSON.parse(data);
}

// --- Export/Import ---
function exportData() {
    // Protection: Teacher cannot export
    if (currentUser?.role !== 'Admin') {
        alert('Permission Denied! Only Administrators can export data.');
        return;
    }

    const dataStr = JSON.stringify(students, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eduflow_records_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
}

function importData(e) {
    // Protection: Teacher cannot import
    if (currentUser?.role !== 'Admin') {
        alert('Permission Denied! Only Administrators can import data.');
        return;
    }

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const imported = JSON.parse(event.target.result);
            if (Array.isArray(imported)) {
                students = imported;
                saveData();
                renderAll();
                alert('Data imported successfully!');
            }
        } catch (err) {
            alert('Invalid file format!');
        }
    };
    reader.readAsText(file);
}
// --- Landing Animations ---
function initLandingAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    
    const revealCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        threshold: 0.15
    });

    reveals.forEach(reveal => revealObserver.observe(reveal));
}

// --- Ranking & Performance logic ---
function renderRankTable() {
    const tbody = document.getElementById('rankTableBody');
    if (!tbody) return;

    const ranked = [...students].sort((a, b) => b.percentage - a.percentage);
    tbody.innerHTML = ranked.map((s, index) => `
        <tr>
            <td><span class="rank-badge rank-${index + 1}">${index + 1}</span></td>
            <td><strong>${s.name}</strong></td>
            <td>${Object.values(s.marks).reduce((a,b) => a+b, 0)}</td>
            <td>${s.percentage.toFixed(1)}%</td>
            <td><span class="grade-pill grade-${s.grade[0]}">${s.grade}</span></td>
        </tr>
    `).join('');
}

// --- Attendance Module ---
const attendanceData = JSON.parse(localStorage.getItem('eduflow_attendance') || '{}');
const todayKey = new Date().toISOString().split('T')[0];

window.updateAttendance = (id, status) => {
    if (!attendanceData[todayKey]) attendanceData[todayKey] = {};
    attendanceData[todayKey][id] = status;
    localStorage.setItem('eduflow_attendance', JSON.stringify(attendanceData));
    renderAttendanceView();
};

function renderAttendanceView() {
    const tbody = document.getElementById('attendanceTableBody');
    if (!tbody) return;

    const dateEl = document.getElementById('attendanceDate');
    if (dateEl) dateEl.innerText = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    tbody.innerHTML = students.map(s => {
        const status = (attendanceData[todayKey] && attendanceData[todayKey][s.id]) || 'pending';
        
        // Calculate monthly % (attendance demo)
        const attendanceCount = Object.values(attendanceData).filter(day => day[s.id] === 'present').length;
        const totalDays = Object.keys(attendanceData).length || 1;
        const percent = ((attendanceCount / totalDays) * 100).toFixed(0);

        return `
            <tr>
                <td>${s.roll}</td>
                <td><strong>${s.name}</strong></td>
                <td>
                    <div class="attendance-controls">
                        <button class="btn-check ${status === 'present' ? 'active' : ''}" onclick="updateAttendance('${s.id}', 'present')"><i class="fas fa-check"></i></button>
                        <button class="btn-check btn-absent ${status === 'absent' ? 'active' : ''}" onclick="updateAttendance('${s.id}', 'absent')"><i class="fas fa-times"></i></button>
                    </div>
                </td>
                <td>${percent}%</td>
                <td><small class="badge-pill ${status === 'present' ? 'badge-A' : (status === 'absent' ? 'badge-F' : 'badge-C')}">${status.toUpperCase()}</small></td>
            </tr>
        `;
    }).join('');
}

const saveAttBtn = document.getElementById('saveAttendance');
if (saveAttBtn) {
    saveAttBtn.onclick = () => {
        logActivity(`Attendance saved for ${Object.keys(attendanceData[todayKey] || {}).length} students.`);
        alert('Daily attendance has been committed to the registry.');
    };
}
