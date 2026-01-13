/**
 * Exam Management Module
 * Handles exam creation, editing, and configuration
 */

class ExamManagement {
    constructor() {
        this.exams = [];
        this.initializeExamManagement();
    }

    /**
     * Initialize exam management
     */
    async initializeExamManagement() {
        await this.loadExams();
        this.renderExamInterface();
    }

    /**
     * Load exams from API
     */
    async loadExams() {
        try {
            const response = await apiClient.get('/api/exams');
            if (response.success) {
                this.exams = response.data || [];
            }
        } catch (error) {
            console.error('Error loading exams:', error);
        }
    }

    /**
     * Render exam management interface
     */
    renderExamInterface() {
        const container = document.getElementById('examManagementContainer');
        if (!container) return;

        const html = `
            <div class="exam-management">
                <div class="exam-header">
                    <h2>Exam Management</h2>
                    <button id="createExamBtn" class="btn btn-primary">+ Create New Exam</button>
                </div>

                <div class="exam-filters">
                    <input type="text" id="examSearch" placeholder="Search exams..." class="form-control">
                    <select id="examTypeFilter" class="form-control">
                        <option value="">All Types</option>
                        <option value="mock">Mock Exam</option>
                        <option value="main">Main Exam</option>
                    </select>
                </div>

                <div id="examList" class="exam-list">
                    <!-- Exams will be listed here -->
                </div>

                <div id="createExamModal" class="modal" style="display: none;">
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <h2>Create New Exam</h2>
                        <form id="createExamForm">
                            <div class="form-group">
                                <label>Exam Name:</label>
                                <input type="text" id="examName" required class="form-control">
                            </div>

                            <div class="form-group">
                                <label>Exam Type:</label>
                                <select id="examType" required class="form-control">
                                    <option value="">Select Type</option>
                                    <option value="mock">Mock Exam</option>
                                    <option value="main">Main Exam</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Exam Date:</label>
                                <input type="date" id="examDate" required class="form-control">
                            </div>

                            <div class="form-group">
                                <label>Total Slots:</label>
                                <input type="number" id="totalSlots" min="1" required class="form-control">
                            </div>

                            <div class="form-group">
                                <label>Slot Duration (minutes):</label>
                                <input type="number" id="slotDuration" min="30" required class="form-control" value="120">
                            </div>

                            <div class="form-group">
                                <label>Start Time:</label>
                                <input type="time" id="startTime" required class="form-control">
                            </div>

                            <div class="form-group">
                                <label>Upload Candidate Excel:</label>
                                <input type="file" id="candidateFile" accept=".xlsx,.xls,.csv" class="form-control">
                            </div>

                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="autoDistribute">
                                    Auto-distribute candidates to slots
                                </label>
                            </div>

                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="autoGeneratePassword">
                                    Auto-generate passwords for operators
                                </label>
                            </div>

                            <button type="submit" class="btn btn-primary">Create Exam</button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.attachEventListeners();
        this.displayExams();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const createBtn = document.getElementById('createExamBtn');
        const modal = document.getElementById('createExamModal');
        const closeBtn = document.querySelector('.close');
        const form = document.getElementById('createExamForm');

        if (createBtn) {
            createBtn.addEventListener('click', () => {
                modal.style.display = 'block';
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => this.handleCreateExam(e));
        }

        const searchInput = document.getElementById('examSearch');
        const typeFilter = document.getElementById('examTypeFilter');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterExams());
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.filterExams());
        }
    }

    /**
     * Display exams
     */
    displayExams() {
        const examList = document.getElementById('examList');
        if (!examList) return;

        if (this.exams.length === 0) {
            examList.innerHTML = '<p>No exams found. Create one to get started.</p>';
            return;
        }

        let html = '';
        for (const exam of this.exams) {
            html += `
                <div class="exam-card">
                    <div class="exam-info">
                        <h3>${exam.name}</h3>
                        <p>Type: <strong>${exam.type === 'mock' ? 'Mock Exam' : 'Main Exam'}</strong></p>
                        <p>Date: <strong>${exam.date}</strong></p>
                        <p>Slots: <strong>${exam.totalSlots}</strong></p>
                        <p>Status: <strong>${exam.status || 'Active'}</strong></p>
                    </div>
                    <div class="exam-actions">
                        <button class="btn btn-secondary" onclick="examManagement.editExam('${exam.id}')">Edit</button>
                        <button class="btn btn-info" onclick="examManagement.viewSlots('${exam.id}')">View Slots</button>
                        <button class="btn btn-warning" onclick="examManagement.generateCredentials('${exam.id}')">Generate Credentials</button>
                        <button class="btn btn-danger" onclick="examManagement.deleteExam('${exam.id}')">Delete</button>
                    </div>
                </div>
            `;
        }

        examList.innerHTML = html;
    }

    /**
     * Handle create exam
     */
    async handleCreateExam(e) {
        e.preventDefault();

        const examData = {
            name: document.getElementById('examName').value,
            type: document.getElementById('examType').value,
            date: document.getElementById('examDate').value,
            totalSlots: parseInt(document.getElementById('totalSlots').value),
            slotDuration: parseInt(document.getElementById('slotDuration').value),
            startTime: document.getElementById('startTime').value,
            autoDistribute: document.getElementById('autoDistribute').checked,
            autoGeneratePassword: document.getElementById('autoGeneratePassword').checked
        };

        try {
            const response = await apiClient.post('/api/exams/create', examData);
            
            if (response.success) {
                alert('Exam created successfully!');
                await auditLogger.logAction('CREATE_EXAM', { examName: examData.name });
                
                // Reset form
                document.getElementById('createExamForm').reset();
                document.getElementById('createExamModal').style.display = 'none';
                
                // Reload exams
                await this.loadExams();
                this.displayExams();
            } else {
                alert('Error creating exam: ' + response.message);
            }
        } catch (error) {
            console.error('Error creating exam:', error);
            alert('Error creating exam. Please try again.');
        }
    }

    /**
     * Edit exam
     */
    async editExam(examId) {
        const exam = this.exams.find(e => e.id === examId);
        if (!exam) return;

        const newName = prompt('Enter new exam name:', exam.name);
        if (!newName) return;

        try {
            const response = await apiClient.put(`/api/exams/${examId}`, { name: newName });
            
            if (response.success) {
                alert('Exam updated successfully!');
                await auditLogger.logAction('EDIT_EXAM', { examId, newName });
                await this.loadExams();
                this.displayExams();
            }
        } catch (error) {
            console.error('Error editing exam:', error);
            alert('Error updating exam.');
        }
    }

    /**
     * View slots
     */
    viewSlots(examId) {
        const exam = this.exams.find(e => e.id === examId);
        if (!exam) return;

        alert(`Slots for ${exam.name}:\n\nTotal Slots: ${exam.totalSlots}\nDuration: ${exam.slotDuration} minutes\n\nSlot details will be displayed in a detailed view.`);
    }

    /**
     * Generate credentials
     */
    async generateCredentials(examId) {
        const exam = this.exams.find(e => e.id === examId);
        if (!exam) return;

        if (!confirm(`Generate credentials for ${exam.name}?`)) {
            return;
        }

        try {
            const response = await apiClient.post(`/api/exams/${examId}/generate-credentials`, {});
            
            if (response.success) {
                alert('Credentials generated successfully!');
                await auditLogger.logAction('GENERATE_CREDENTIALS', { examId });
                
                // Option to download credentials
                if (response.data?.downloadUrl) {
                    window.open(response.data.downloadUrl);
                }
            }
        } catch (error) {
            console.error('Error generating credentials:', error);
            alert('Error generating credentials.');
        }
    }

    /**
     * Delete exam
     */
    async deleteExam(examId) {
        const exam = this.exams.find(e => e.id === examId);
        if (!exam) return;

        if (!confirm(`Are you sure you want to delete ${exam.name}?`)) {
            return;
        }

        try {
            const response = await apiClient.delete(`/api/exams/${examId}`);
            
            if (response.success) {
                alert('Exam deleted successfully!');
                await auditLogger.logAction('DELETE_EXAM', { examId, examName: exam.name });
                await this.loadExams();
                this.displayExams();
            }
        } catch (error) {
            console.error('Error deleting exam:', error);
            alert('Error deleting exam.');
        }
    }

    /**
     * Filter exams
     */
    filterExams() {
        const searchTerm = document.getElementById('examSearch').value.toLowerCase();
        const typeFilter = document.getElementById('examTypeFilter').value;

        const filtered = this.exams.filter(exam => {
            const matchesSearch = exam.name.toLowerCase().includes(searchTerm);
            const matchesType = !typeFilter || exam.type === typeFilter;
            return matchesSearch && matchesType;
        });

        const examList = document.getElementById('examList');
        if (filtered.length === 0) {
            examList.innerHTML = '<p>No exams match your filters.</p>';
            return;
        }

        let html = '';
        for (const exam of filtered) {
            html += `
                <div class="exam-card">
                    <div class="exam-info">
                        <h3>${exam.name}</h3>
                        <p>Type: <strong>${exam.type === 'mock' ? 'Mock Exam' : 'Main Exam'}</strong></p>
                        <p>Date: <strong>${exam.date}</strong></p>
                        <p>Slots: <strong>${exam.totalSlots}</strong></p>
                    </div>
                    <div class="exam-actions">
                        <button class="btn btn-secondary" onclick="examManagement.editExam('${exam.id}')">Edit</button>
                        <button class="btn btn-info" onclick="examManagement.viewSlots('${exam.id}')">View Slots</button>
                        <button class="btn btn-warning" onclick="examManagement.generateCredentials('${exam.id}')">Generate Credentials</button>
                        <button class="btn btn-danger" onclick="examManagement.deleteExam('${exam.id}')">Delete</button>
                    </div>
                </div>
            `;
        }

        examList.innerHTML = html;
    }
}

// Create global exam management instance
const examManagement = new ExamManagement();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ExamManagement, examManagement };
}
