/**
 * Skoop Content Manager - CRUD Engine
 * Handles notice management with LocalStorage persistence.
 */
class NoticeManager {
    constructor() {
        this.notices = JSON.parse(localStorage.getItem('skoop_notices')) || [
            {
                id: Date.now(),
                title: "WELCOME TO SKOOP CMS",
                content: "This is a demonstration of a full CRUD application for digital signage. You can create, read, update, and delete announcements here.",
                category: "GENERAL",
                priority: "NORMAL",
                date: new Date().toLocaleString()
            }
        ];

        this.elements = {
            form: document.getElementById('notice-form'),
            formTitle: document.getElementById('form-title'),
            noticeId: document.getElementById('notice-id'),
            titleInput: document.getElementById('notice-title'),
            categoryInput: document.getElementById('notice-category'),
            priorityInput: document.getElementById('notice-priority'),
            contentInput: document.getElementById('notice-content'),
            submitBtn: document.getElementById('submit-btn'),
            cancelBtn: document.getElementById('cancel-btn'),
            noticeList: document.getElementById('notice-list'),
            noticeCount: document.getElementById('notice-count'),
            timeDisplay: document.getElementById('current-time')
        };

        this.init();
    }

    init() {
        // Event Listeners
        this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.elements.cancelBtn.addEventListener('click', () => this.resetForm());

        // Clock Update
        setInterval(() => this.updateClock(), 1000);
        this.updateClock();

        // Initial Render
        this.renderNotices();
    }

    updateClock() {
        const now = new Date();
        this.elements.timeDisplay.textContent = now.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    saveToStorage() {
        localStorage.setItem('skoop_notices', JSON.stringify(this.notices));
        this.renderNotices();
    }

    handleSubmit(e) {
        e.preventDefault();

        const id = this.elements.noticeId.value;
        const noticeData = {
            title: this.elements.titleInput.value.toUpperCase(),
            category: this.elements.categoryInput.value,
            priority: this.elements.priorityInput.value,
            content: this.elements.contentInput.value,
            date: new Date().toLocaleString()
        };

        if (id) {
            // Update Existing
            const index = this.notices.findIndex(n => n.id == id);
            if (index !== -1) {
                this.notices[index] = { ...this.notices[index], ...noticeData };
            }
        } else {
            // Create New
            noticeData.id = Date.now();
            this.notices.unshift(noticeData);
        }

        this.saveToStorage();
        this.resetForm();
    }

    deleteNotice(id) {
        if (confirm('Are you sure you want to delete this notice?')) {
            this.notices = this.notices.filter(n => n.id != id);
            this.saveToStorage();
        }
    }

    editNotice(id) {
        const notice = this.notices.find(n => n.id == id);
        if (notice) {
            this.elements.formTitle.textContent = "EDIT ANNOUNCEMENT";
            this.elements.noticeId.value = notice.id;
            this.elements.titleInput.value = notice.title;
            this.elements.categoryInput.value = notice.category;
            this.elements.priorityInput.value = notice.priority;
            this.elements.contentInput.value = notice.content;

            this.elements.submitBtn.innerHTML = '<i class="fas fa-save"></i> UPDATE NOTICE';
            this.elements.cancelBtn.classList.remove('hidden');

            // Scroll form into view if needed
            this.elements.form.scrollIntoView({ behavior: 'smooth' });
        }
    }

    resetForm() {
        this.elements.form.reset();
        this.elements.noticeId.value = "";
        this.elements.formTitle.textContent = "CREATE NEW ANNOUNCEMENT";
        this.elements.submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> PUBLISH NOTICE';
        this.elements.cancelBtn.classList.add('hidden');
    }

    getCategoryClass(category) {
        switch(category) {
            case 'URGENT': return 'tag-urgent';
            case 'MAINTENANCE': return 'tag-maint';
            case 'EVENT': return 'tag-event';
            default: return 'tag-general';
        }
    }

    renderNotices() {
        this.elements.noticeList.innerHTML = '';
        this.elements.noticeCount.textContent = this.notices.length;

        if (this.notices.length === 0) {
            this.elements.noticeList.innerHTML = `
                <div class="notice-item" style="text-align: center; opacity: 0.5; padding: 3rem;">
                    <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>NO ACTIVE NOTICES FOUND</p>
                </div>
            `;
            return;
        }

        this.notices.forEach(notice => {
            const item = document.createElement('div');
            item.className = 'notice-item';

            item.innerHTML = `
                <div class="notice-header">
                    <div class="notice-title">${notice.title}</div>
                    <div class="notice-tags">
                        <span class="tag ${this.getCategoryClass(notice.category)}">${notice.category}</span>
                        <span class="tag priority-${notice.priority.toLowerCase()}">${notice.priority}</span>
                    </div>
                </div>
                <div class="notice-body">${notice.content}</div>
                <div class="notice-footer">
                    <div class="notice-date"><i class="far fa-clock"></i> ${notice.date}</div>
                    <div class="notice-actions">
                        <button class="action-btn edit-btn" onclick="app.editNotice(${notice.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="app.deleteNotice(${notice.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            this.elements.noticeList.appendChild(item);
        });
    }
}

// Initialize App
let app;
window.addEventListener('load', () => {
    app = new NoticeManager();
});
