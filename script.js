// Create storage for items
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

function getNotes() {
	return items.filter((item) => item.type === 'note');
}

function getTasks() {
	return items.filter((item) => item.type === 'task');
}

function getPinnedItems() {
	return items.filter((item) => item.isPinned);
}

function getItems() {
	return items;
}

console.log(getPinnedItems());
