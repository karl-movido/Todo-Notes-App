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
let currentFilter = 'all';
let selectedTag = null;
let searchQuery = '';

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
	let filtered = getItems();

	// Filter by view
	if (currentView === 'notes') {
		filtered = filtered.filter((item) => item.type === 'note');
	} else if (currentView === 'task') {
		filtered = filtered.filter((item) => item.type === 'task');
	}

	// Filter by status
	if (currentFilter === 'completed') {
		filtered = filtered.filter((item) => item.isCompleted);
	}

	// Filter by tag
	if (selectedTag !== null) {
		filtered = filtered.filter((item) => item.tags.includes(selectedTag));
	}

	// Filter by Search Query
	if (searchQuery.trim() !== '') {
		filtered = filtered.filter(
			(item) =>
				item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.body.toLowerCase().includes(searchQuery.toLowerCase()),
		);
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
	const currentItems = getFilteredItems();

	const pinnedItems = currentItems.filter((item) => item.isPinned);
	const regularItems = currentItems.filter((item) => !item.isPinned);

	const pinnedContainer = $('pinned-container');
	const regularContainer = $('regular-container');

	pinnedContainer.innerHTML = '';
	regularContainer.innerHTML = '';

	pinnedContainer.innerHTML = pinnedItems.map((item) => createCardHTML(item)).join('');
	regularContainer.innerHTML = regularItems.map((item) => createCardHTML(item)).join('');

	lucide.createIcons();
}

function createCardHTML(item) {
	let checkboxHTML = '';
	if (item.type === 'task') {
		checkboxHTML = `<button class="icon-btn check">${item.isCompleted ? `<i data-lucide="circle"></i>` : `<i data-lucide="circle-check"></i>`}</button>`;
	}

	const tagsHTML = item.tags.map((tag) => `<span class="tag-chip">${tag}</span>`).join('');

	const priorityDotHTML = `<span class="priority-dot dot-${item.priority}"></span>`;

	return `
        <div class="card" data-id="${item.id}">
            <div class="card-top">
                <div class="card-tags">${tagsHTML}</div>${priorityDotHTML}
            </div>
            <div class="card-header">
                <div class="card-title">${item.title}</div>
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

renderApp();
console.log(createItem('task', 'Buy groceries', 'Milk, sugar, coffee', ['Personal', 'Grocery']));
