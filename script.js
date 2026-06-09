// Data store: initial todo and note items
let items = [
	{
		id: 'dummy-id-1',
		type: 'note',
		title: 'Project Ideas',
		body: '1. A pure JS markdown editor.\n2. A personal finance tracker.\n3. This awesome note-taking app!',
		isPinned: true,
		isCompleted: false, // Notes don't use this, so we default to false
		priority: 'medium',
		tags: ['coding', 'creative'],
		createdAt: '2026-06-07T09:00:00.000Z',
		updatedAt: '2026-06-08T14:22:00.000Z',
	},
	{
		id: 'dummy-id-2',
		type: 'task',
		title: 'Buy groceries for dinner',
		body: 'Need to pick up chicken, garlic, pasta, and some parmesan cheese.',
		isPinned: false,
		isCompleted: false, // Uncompleted task
		priority: 'high',
		tags: ['shopping', 'personal'],
		createdAt: '2026-06-08T08:00:00.000Z',
		updatedAt: '2026-06-08T08:00:00.000Z',
	},
	{
		id: 'dummy-id-3',
		type: 'task',
		title: 'Water the indoor plants',
		body: "Don't overwater the monstera this time.",
		isPinned: false,
		isCompleted: true, // Completed task
		priority: 'low',
		tags: ['home'],
		createdAt: '2026-06-06T11:00:00.000Z',
		updatedAt: '2026-06-07T10:00:00.000Z',
	},
];

// Get element by Id helper
const $ = (id) => document.getElementById(id);

// UI state variables for filtering and search
let currentView = 'all';
let currentStatus = 'all';
let selectedTag = null;
let searchQuery = '';
let currentSort = 'newest';
let selectedItemId = null;

// Getter functions for item subsets
function getItems() {
	return items;
}

function getNotes() {
	return items.filter((item) => item.type === 'note');
}

function getTasks() {
	return items.filter((item) => item.type === 'task');
}

function getPinnedItems() {
	return items.filter((item) => item.isPinned);
}

function getFilteredItems() {
	// 1. Filter by Sidebar View (all/notes/tasks) and Tags
	let filtered = items.filter((item) => {
		const matchesView =
			currentView === 'all' ||
			(currentView === 'notes' && item.type === 'note') ||
			(currentView === 'tasks' && item.type === 'task');

		const matchesTag = !selectedTag || item.tags.includes(selectedTag);

		return matchesView && matchesTag;
	});

	// 2. Filter by status
	if (currentStatus === 'completed') {
		filtered = filtered.filter((item) => item.type === 'task' && item.isCompleted === true);
	} else if (currentStatus === 'active') {
		filtered = filtered.filter((item) => item.type === 'note' || (item.type === 'task' && item.isCompleted === false));
	} else if (currentStatus === 'pinned') {
		filtered = filtered.filter((item) => item.isPinned === true);
	}

	// 3. Filter by Search Query (Moved UP for optimal performance!)
	if (searchQuery.trim() !== '') {
		filtered = filtered.filter(
			(item) =>
				item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.body.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}

	// 4. Filter by sorting (Now only works on the final group)
	if (currentSort === 'oldest') {
		filtered.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
	} else if (currentSort === 'priority') {
		const priorityWeight = { high: 3, medium: 2, low: 1, none: 0 };

		filtered.sort((a, b) => {
			const weightA = priorityWeight[a.priority] || 0;
			const weightB = priorityWeight[b.priority] || 0;
			return weightB - weightA;
		});
	} else {
		filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
	}

	return filtered;
}

// CRUD helper functions for managing items
// Create a new note or task
function createItem(type, title, body, tags = [], priority = 'none') {
	const newItem = {
		id: crypto.randomUUID(),
		type,
		title,
		body,
		isPinned: false,
		isCompleted: false,
		priority,
		tags,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	items.push(newItem);
	return newItem;
}

// Update an existing item by id
function updateItem(id, updates) {
	items = items.map((item) => {
		if (item.id === id) {
			return { ...item, ...updates, updatedAt: new Date().toISOString() };
		}
		return item;
	});

	return items.find((item) => item.id === id) || null;
}

// Remove an item by id
function deleteItem(id) {
	items = items.filter((item) => item.id !== id);
}

// Render the information to the website
function renderApp() {
	const currentItems = getFilteredItems() || [];

	const pinnedItems = currentItems.filter((item) => item.isPinned === true);
	const regularItems = currentItems.filter((item) => item.isPinned !== true);

	const pinnedSection = $('pinned-section-wrapper');
	const regularSection = $('regular-section-wrapper');

	const pinnedContainer = $('pinned-container');
	const regularContainer = $('regular-container');
	const pinnedHead = $('pinned-section-head');
	const regularHead = $('regular-section-head');

	pinnedContainer.innerHTML = '';
	regularContainer.innerHTML = '';

	if (pinnedItems.length === 0) {
		pinnedSection.style.display = 'none';
	} else {
		pinnedSection.style.display = 'block';

		if (currentView === 'all') pinnedHead.innerText = '📌 Pinned';
		else if (currentView === 'notes') pinnedHead.innerText = '📌 Pinned Notes';
		else if (currentView === 'tasks') pinnedHead.innerText = '📌 Pinned Tasks';

		pinnedContainer.innerHTML = pinnedItems.map((item) => createCardHTML(item)).join('');
	}

	if (regularItems.length === 0) {
		regularSection.style.display = 'none';
	} else {
		regularSection.style.display = 'block';

		if (currentView === 'all') regularHead.innerText = 'Recent';
		else if (currentView === 'notes') regularHead.innerText = 'Notes';
		else if (currentView === 'tasks') regularHead.innerText = 'Tasks';
		regularContainer.innerHTML = regularItems.map((item) => createCardHTML(item)).join('');
	}

	const mainWorkspace = $('cards');
	const noResultMsg = $('no-results');

	if (currentItems.length === 0) {
		if (!noResultMsg) {
			const messageHTML = `
			<div id="no-results" class="empty-state">
				<i data-lucide="search-x"></i>
				<p>No notes or tasks match your search.</p>
			</div>
		`;

			mainWorkspace.insertAdjacentHTML('beforeend', messageHTML);
		}
	} else {
		if (noResultMsg) {
			noResultMsg.remove();
		}
	}

	const detailsAside = $('details');

	if (detailsAside) {
		const activeItem = items.find((item) => item.id === selectedItemId);

		detailsAside.innerHTML = createDetailsHTML(activeItem);
	}

	renderDetails();

	updateCounters();
	renderSidebarTags();

	if (window.lucide) {
		lucide.createIcons();
	}
}

function renderDetails() {
	const detailsAside = document.querySelector('aside.details');
	if (!detailsAside) return;

	const activeItem = items.find((item) => item.id === selectedItemId);

	detailsAside.innerHTML = createDetailsHTML(activeItem);

	lucide.createIcons();
}

function renderSidebarTags() {
	const tagListContainer = $('tag-list');

	if (!tagListContainer) return;

	let allTags = [];
	items.forEach((item) => {
		allTags = allTags.concat(item.tags);
	});

	const uniqueTags = [...new Set(allTags)];

	tagListContainer.innerHTML = '';

	uniqueTags.forEach((tag) => {
		const tagCount = items.filter((item) => item.tags.includes(tag)).length;

		const isActive = selectedTag === tag ? 'active' : '';

		const tagHTML = `
            <div class="tag-item ${isActive}" data-tag="${tag}"><span class="tag-dot"></span>${tag}<span class="tag-count">${tagCount}</span></div>
        `;

		tagListContainer.insertAdjacentHTML('beforeend', tagHTML);
	});
}

// Create a card from item values
function createCardHTML(item) {
	let checkboxHTML = '';
	if (item.type === 'task') {
		checkboxHTML = `<button class="icon-btn check">${item.isCompleted ? `<i data-lucide="circle-check"></i>` : `<i data-lucide="circle"></i>`}</button>`;
	}

	const tagsHTML = item.tags.map((tag) => `<span class="tag-chip">${tag}</span>`).join('');

	const priorityDotHTML = `<span class="priority-dot dot-${item.priority}"></span>`;

	const isActive = item.id === selectedItemId ? 'active' : '';
	const cardStateClass = item.isCompleted ? 'done-card' : '';
	const titleClass = item.isCompleted ? 'card-title done' : 'card-title';

	return `
        <div class="card ${isActive} ${cardStateClass}" data-id="${item.id}">
            <div class="card-top">
                <div class="card-tags">${tagsHTML}</div>${priorityDotHTML}
            </div>
            <div class="card-header">
                <div class="${titleClass}">${item.title}</div>
                ${checkboxHTML}
            </div>
            <div class="card-body">${item.body}</div>
            <div class="card-footer">
                <span class="card-date">${new Date(item.updatedAt).toLocaleDateString()}</span>
                <button class="icon-btn menu"><i data-lucide="ellipsis-vertical"></i></button>
                <div class="menu-actions">
                    <button class="menu-action icon-btn" data-action="edit">
                        <i data-lucide="pencil"></i><span class="action-title">Edit</span>
                    </button>
                    <button class="menu-action icon-btn" data-action="pin">
                        <i data-lucide="pin"></i><span class="action-title">Pin</span>
                    </button>
                    <button class="menu-action icon-btn danger" data-action="delete">
                        <i data-lucide="trash"></i><span class="action-title">Delete</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function createDetailsHTML(item) {
	if (!item) {
		return `
			<div class="details-main" style="text-align: center; padding-top: 40px; color: var(--text-muted);">
                <i data-lucide="notebook-text" style="width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.5;"></i>
                <p>Select a note or task to view its full details.</p>
            </div>
		`;
	}

	const tagsHTML = item.tags.map((tag) => `<span class="tag-chip">${tag}</span>`).join('');

	const pinIconClass = item.isPinned ? 'pin-off' : 'pin';

	return `
		<div class="details-header">
            <div class="details-section-label">Details</div>
            <div class="details-actions" data-id="${item.id}">
                <button class="icon-btn action-pin" title="Toggle Pin">
                    <i data-lucide="${item.isPinned ? 'pin-off' : 'pin'}"></i>
                </button>
                <button class="icon-btn action-edit" title="Edit Item"><i data-lucide="pencil"></i></button>
                <button class="icon-btn danger action-delete" title="Delete Item"><i data-lucide="trash"></i></button>
            </div>
        </div>
        <div class="details-main">
            <h1 class="details-title">${item.title}</h1>
            <div class="details-body">${item.body || '<em>No description provided.</em>'}</div>
        </div>
        <div class="divider"></div>
        <div class="details-footer">
            <div class="details-activity">
                <div class="details-section-label">Activity</div>
                <div class="details-meta">Updated ${new Date(item.updatedAt).toLocaleDateString()}</div>
            </div>
            <div class="details-priority">
                <div class="details-section-label">Priority</div>
                <div class="priority ${item.priority || 'none'}">${item.priority ? item.priority.charAt(0).toUpperCase() + item.priority.slice(1) : 'None'}</div>
            </div>
            <div class="details-tags">
                <div class="details-section-label">Tags</div>
                <div class="details-tag">
                    ${tagsHTML || '<span class="text-muted" style="font-size: 0.85rem; font-style: italic;">No tags</span>'}
                </div>
            </div>
        </div>
	`;
}

function handleCardClick(event) {
	if (event.target.closest('.check') || event.target.closest('.menu') || event.target.closest('.menu-actions')) {
		return;
	}

	const card = event.target.closest('.card');
	if (!card) return;

	selectedItemId = card.getAttribute('data-id');

	document.querySelectorAll('.card').forEach((c) => c.classList.remove('active'));
	card.classList.add('active');

	renderDetails();
}

function handleCardContainerClick(event) {
	event.preventDefault();

	const menuBtn = event.target.closest('.menu');
	if (menuBtn) {
		const card = menuBtn.closest('.card');
		if (card) {
			document.querySelectorAll('.menu-actions').forEach((menu) => {
				const parentCard = menu.closest('.card');
				if (parentCard !== card) {
					menu.classList.remove('show');
				}
			});

			const menuActions = card.querySelector('.menu-actions');
			if (menuActions) {
				menuActions.classList.toggle('show');
			}
			return;
		}
	}

	const actionBtn = event.target.closest('.menu-action');
	if (actionBtn) {
		const card = actionBtn.closest('.card');
		if (!card) return;

		const targetId = card.getAttribute('data-id');
		const itemIndex = items.findIndex((item) => item.id == targetId);
		if (itemIndex === -1) return;

		const action = actionBtn.getAttribute('data-action');

		if (action === 'pin') {
			items[itemIndex].isPinned = !items[itemIndex].isPinned;
			items[itemIndex].updatedAt = new Date().toISOString();
			renderApp(); // Re-draws grid, moving the pinned card instantly
		} else if (action === 'delete') {
			if (confirm('Are you sure you want to delete this item?')) {
				items.splice(itemIndex, 1);

				// If the deleted item is currently open in the details pane, close the pane
				if (selectedItemId === targetId) {
					selectedItemId = null;
				}

				renderApp();
			}
		} else if (action === 'edit') {
			console.log('Edit clicked for item:', targetId);
			// We can wire up your edit modal/form logic here
		}

		// Hide the action menu after an option is clicked
		const menuActions = card.querySelector('.menu-actions');
		if (menuActions) {
			menuActions.classList.remove('show');
		}

		return;
	}

	const checkBtn = event.target.closest('.check');
	if (checkBtn) {
		const card = checkBtn.closest('.card');
		if (!card) return;

		const targetId = card.getAttribute('data-id');
		const itemIndex = items.findIndex((item) => item.id === targetId);
		if (itemIndex === -1) return;

		const item = items[itemIndex];
		if (item.type === 'task') {
			items[itemIndex] = {
				...item,
				isCompleted: !item.isCompleted,
				updatedAt: new Date().toISOString(),
			};
			renderApp();
		}

		return;
	}
}

$('pinned-container').addEventListener('click', handleCardClick);
$('pinned-container').addEventListener('click', handleCardContainerClick);
$('regular-container').addEventListener('click', handleCardClick);
$('regular-container').addEventListener('click', handleCardContainerClick);

// Details panel action listener
const detailsAside = document.querySelector('aside.details');

if (detailsAside) {
	detailsAside.addEventListener('click', (e) => {
		const pinBtn = e.target.closest('.action-pin');
		const deleteBtn = e.target.closest('.action-delete');

		if (!pinBtn && !deleteBtn) return;

		if (!selectedItemId) return;

		const itemIndex = items.findIndex((item) => item.id === selectedItemId);

		if (itemIndex === -1) return;

		if (pinBtn) {
			items[itemIndex].isPinned = !items[itemIndex].isPinned;
			items[itemIndex].updatedAt = new Date().toISOString();
			renderApp();
		}

		if (deleteBtn) {
			if (confirm('Are you sure you want to delete this item?')) {
				items.splice(itemIndex, 1);
				selectedItemId = null;
				renderApp();
			}
		}
	});
}

// Filter items by type from sidebar navigation
const sidebar = document.querySelector('.sidebar');

sidebar.addEventListener('click', (e) => {
	const sidebarItem = e.target.closest('.sidebar-item');

	if (!sidebarItem) return;

	const targetView = sidebarItem.getAttribute('data-view');

	currentView = targetView;

	document.querySelectorAll('.sidebar-item').forEach((item) => {
		item.classList.remove('active');
	});

	sidebarItem.classList.add('active');

	renderApp();
});

// Filter items by tags from sidebar
const tagListContainer = $('tag-list');

tagListContainer.addEventListener('click', (e) => {
	const tagItem = e.target.closest('.tag-item');
	if (!tagItem) return;

	const clickedTag = tagItem.getAttribute('data-tag');

	if (selectedTag === clickedTag) {
		selectedTag = null;
	} else {
		selectedTag = clickedTag;
	}

	renderApp();
});

// Filter items by status
const statusContainer = $('status');

statusContainer.addEventListener('click', (e) => {
	const statusItem = e.target.closest('.status-item');
	if (!statusItem) return;

	const targetStatus = statusItem.getAttribute('data-status');

	currentStatus = targetStatus;

	document.querySelectorAll('.status-item').forEach((item) => {
		item.classList.remove('active');
	});

	statusItem.classList.add('active');

	renderApp();
});

// Filter items by sorting
const sortSelect = $('sort');

sortSelect.addEventListener('change', (e) => {
	const selectedSort = e.target.value;

	currentSort = selectedSort;

	renderApp();
});

// Filter by search query
const searchInput = $('search');

if (searchInput) {
	searchInput.addEventListener('input', (e) => {
		searchQuery = e.target.value;

		renderApp();
	});
}

// Update counters
function updateCounters() {
	const countAllEl = $('count-all');
	const countTaskEl = $('count-task');
	const countNoteEl = $('count-note');

	const totalItems = items.length;

	const totalTasks = getTasks().length;
	const totalNotes = getNotes().length;

	if (countAllEl) countAllEl.innerText = totalItems;
	if (countNoteEl) countNoteEl.innerText = totalNotes;
	if (countTaskEl) countTaskEl.innerText = totalTasks;
}

const overlay = document.getElementById('overlay');
const btnNew = document.getElementById('btn-new');
const modalCloseBtn = document.getElementById('modal-close');
const btnCancel = document.getElementById('btn-cancel');
const btnSave = document.getElementById('btn-save');

if (btnNew && overlay) {
	btnNew.addEventListener('click', () => {
		overlay.classList.toggle('open');
	});
}

const closeModal = () => {
	overlay.classList.remove('open');

	document.getElementById('f-type').value = 'note';
	document.getElementById('f-priority').value = 'none';
	document.getElementById('f-tag').value = '';
	document.getElementById('f-title').value = '';
	document.getElementById('f-body').value = '';
};

if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
if (btnCancel) btnCancel.addEventListener('click', closeModal);

if (btnSave) {
	btnSave.addEventListener('click', () => {
		const titleValue = document.getElementById('f-title').value.trim();
		const rawTypeValue = document.getElementById('f-type').value;
		const priorityValue = document.getElementById('f-priority').value;
		const bodyValue = document.getElementById('f-body').value;
		const tagValue = document.getElementById('f-tag').value.trim();

		if (!titleValue) {
			alert('Please enter a title before saving!');
			return;
		}

		const typeValue = rawTypeValue === 'task' ? 'task' : 'note';

		const tagsArray = tagValue
			? tagValue
					.split(',')
					.map((t) => t.trim())
					.filter((t) => t.length > 0)
			: [];

		const newItem = {
			id: Date.now().toString(),
			title: titleValue,
			type: typeValue,
			body: bodyValue,
			priority: priorityValue,
			tags: tagsArray,
			isPinned: false,
			isCompleted: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		items.push(newItem);

		selectedItemId = newItem.id;

		closeModal();
		renderApp();

		if (window.lucide) {
			lucide.createIcons();
		}
	});
}

renderApp();
