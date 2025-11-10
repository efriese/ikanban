// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    });
}

// Application State
let state = {
    boards: [],
    currentBoardId: null,
    editingCard: null,
    draggedCard: null,
    draggedColumn: null,
    currentView: 'board' // 'board' or 'taskFeed'
};

// DOM Elements
const boardSelector = document.getElementById('boardSelector');
const newBoardBtn = document.getElementById('newBoardBtn');
const emptyState = document.getElementById('emptyState');
const boardContainer = document.getElementById('boardContainer');
const boardTitle = document.getElementById('boardTitle');
const addColumnBtn = document.getElementById('addColumnBtn');
const columnsContainer = document.getElementById('columnsContainer');

const boardModal = document.getElementById('boardModal');
const boardNameInput = document.getElementById('boardNameInput');
const createBoardBtn = document.getElementById('createBoardBtn');
const cancelBoardBtn = document.getElementById('cancelBoardBtn');

const columnModal = document.getElementById('columnModal');
const columnNameInput = document.getElementById('columnNameInput');
const createColumnBtn = document.getElementById('createColumnBtn');
const cancelColumnBtn = document.getElementById('cancelColumnBtn');

const cardModal = document.getElementById('cardModal');
const cardModalTitle = document.getElementById('cardModalTitle');
const cardTitleInput = document.getElementById('cardTitleInput');
const cardDescInput = document.getElementById('cardDescInput');
const cardDueDateInput = document.getElementById('cardDueDateInput');
const checklistItems = document.getElementById('checklistItems');
const addChecklistItemBtn = document.getElementById('addChecklistItemBtn');
const saveCardBtn = document.getElementById('saveCardBtn');
const cancelCardBtn = document.getElementById('cancelCardBtn');

const backgroundModal = document.getElementById('backgroundModal');
const bgColorInput = document.getElementById('bgColorInput');
const bgImageInput = document.getElementById('bgImageInput');
const bgFileInput = document.getElementById('bgFileInput');
const saveBackgroundBtn = document.getElementById('saveBackgroundBtn');
const cancelBackgroundBtn = document.getElementById('cancelBackgroundBtn');
const colorOption = document.getElementById('colorOption');
const imageOption = document.getElementById('imageOption');
const fileOption = document.getElementById('fileOption');

const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const settingsBackgroundBtn = document.getElementById('settingsBackgroundBtn');
const settingsArchiveBtn = document.getElementById('settingsArchiveBtn');
const settingsDeleteBtn = document.getElementById('settingsDeleteBtn');
const darkModeToggle = document.getElementById('darkModeToggle');

const headerMenuBtn = document.getElementById('headerMenuBtn');
const headerMenu = document.getElementById('headerMenu');
const viewArchivedBtn = document.getElementById('viewArchivedBtn');
const archivedModal = document.getElementById('archivedModal');
const archivedBoardsList = document.getElementById('archivedBoardsList');
const closeArchivedBtn = document.getElementById('closeArchivedBtn');

const taskFeedBtn = document.getElementById('taskFeedBtn');
const taskFeedContainer = document.getElementById('taskFeedContainer');
const taskFeedContent = document.getElementById('taskFeedContent');

// Local Storage Functions
function saveToLocalStorage() {
    try {
        localStorage.setItem('ikanban-state', JSON.stringify(state));
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            throw error; // Re-throw to be caught by caller
        }
        console.error('Error saving to localStorage:', error);
    }
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('ikanban-state');
    if (saved) {
        state = JSON.parse(saved);
    }
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatCardHtml(card) {
    let html = `<div class="card-title">${card.title}</div>`;

    if (card.description) {
        const descText = card.description.replace(/<[^>]*>/g, '').substring(0, 100);
        html += `<div class="card-description">${descText}${descText.length >= 100 ? '...' : ''}</div>`;
    }

    // Add metadata badges
    const hasMeta = card.dueDate || (card.checklist && card.checklist.length > 0);
    if (hasMeta) {
        html += '<div class="card-meta">';

        // Due date badge
        if (card.dueDate) {
            const dueDate = new Date(card.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dueDateOnly = new Date(dueDate);
            dueDateOnly.setHours(0, 0, 0, 0);

            const diffTime = dueDateOnly - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let className = 'card-badge due-date';
            if (diffDays < 0) className += ' overdue';
            else if (diffDays <= 2) className += ' due-soon';

            const formattedDate = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            html += `<span class="${className}">📅 ${formattedDate}</span>`;
        }

        // Checklist badge
        if (card.checklist && card.checklist.length > 0) {
            const completed = card.checklist.filter(item => item.checked).length;
            const total = card.checklist.length;
            html += `<span class="card-badge checklist">✓ ${completed}/${total}</span>`;
        }

        html += '</div>';
    }

    return html;
}

// Board Functions
function createBoard(name) {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const board = {
        id: generateId(),
        name: name,
        columns: [],
        background: {
            type: 'color',
            value: isDarkMode ? '#374151' : '#f1f5f9'
        },
        archived: false
    };
    state.boards.push(board);
    saveToLocalStorage();
    updateBoardSelector();
    selectBoard(board.id);
}

function deleteBoard(boardId) {
    if (confirm('Are you sure you want to delete this board?')) {
        state.boards = state.boards.filter(b => b.id !== boardId);
        state.currentBoardId = null;
        saveToLocalStorage();
        updateBoardSelector();
        renderBoard();
    }
}

function archiveBoard(boardId) {
    if (confirm('Are you sure you want to archive this board?')) {
        const board = state.boards.find(b => b.id === boardId);
        if (board) {
            board.archived = true;
            state.currentBoardId = null;
            saveToLocalStorage();
            updateBoardSelector();
            renderBoard();
            closeSettingsModal();
        }
    }
}

function unarchiveBoard(boardId) {
    const board = state.boards.find(b => b.id === boardId);
    if (board) {
        board.archived = false;
        saveToLocalStorage();
        renderArchivedBoards();
        updateBoardSelector();
    }
}

function selectBoard(boardId) {
    state.currentBoardId = boardId;
    boardSelector.value = boardId;
    renderBoard();
}

function getCurrentBoard() {
    return state.boards.find(b => b.id === state.currentBoardId);
}

function updateBoardBackground(type, value) {
    const board = getCurrentBoard();
    if (!board) return;

    board.background = { type, value };
    saveToLocalStorage();
    renderBoard();
}

// Column Functions
function createColumn(name) {
    const board = getCurrentBoard();
    if (!board) return;

    const column = {
        id: generateId(),
        name: name,
        cards: []
    };
    board.columns.push(column);
    saveToLocalStorage();
    renderBoard();
}

function deleteColumn(columnId) {
    const board = getCurrentBoard();
    if (!board) return;

    board.columns = board.columns.filter(c => c.id !== columnId);
    saveToLocalStorage();
    renderBoard();
}

function reorderColumns(fromIndex, toIndex) {
    const board = getCurrentBoard();
    if (!board) return;

    const [column] = board.columns.splice(fromIndex, 1);
    board.columns.splice(toIndex, 0, column);

    saveToLocalStorage();
    renderBoard();
}

// Card Functions
function createCard(columnId, title, description, dueDate, checklist) {
    const board = getCurrentBoard();
    if (!board) return;

    const column = board.columns.find(c => c.id === columnId);
    if (!column) return;

    const card = {
        id: generateId(),
        title: title,
        description: description,
        dueDate: dueDate || null,
        checklist: checklist || []
    };
    column.cards.push(card);
    saveToLocalStorage();
    renderBoard();
}

function updateCard(columnId, cardId, title, description, dueDate, checklist) {
    const board = getCurrentBoard();
    if (!board) return;

    const column = board.columns.find(c => c.id === columnId);
    if (!column) return;

    const card = column.cards.find(c => c.id === cardId);
    if (!card) return;

    card.title = title;
    card.description = description;
    card.dueDate = dueDate || null;
    card.checklist = checklist || [];
    saveToLocalStorage();
    renderBoard();
}

function deleteCard(columnId, cardId) {
    const board = getCurrentBoard();
    if (!board) return;

    const column = board.columns.find(c => c.id === columnId);
    if (!column) return;

    column.cards = column.cards.filter(c => c.id !== cardId);
    saveToLocalStorage();
    renderBoard();
}

function moveCard(fromColumnId, toColumnId, cardId, targetIndex = null) {
    const board = getCurrentBoard();
    if (!board) return;

    const fromColumn = board.columns.find(c => c.id === fromColumnId);
    const toColumn = board.columns.find(c => c.id === toColumnId);

    if (!fromColumn || !toColumn) return;

    const cardIndex = fromColumn.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const [card] = fromColumn.cards.splice(cardIndex, 1);

    if (targetIndex !== null && fromColumnId === toColumnId && targetIndex > cardIndex) {
        // Adjust index if moving within same column and target is after source
        targetIndex--;
    }

    if (targetIndex !== null) {
        toColumn.cards.splice(targetIndex, 0, card);
    } else {
        toColumn.cards.push(card);
    }

    saveToLocalStorage();
    renderBoard();
}

// Render Functions
function updateBoardSelector() {
    boardSelector.innerHTML = '<option value="">Select Board</option>';
    state.boards.filter(board => !board.archived).forEach(board => {
        const option = document.createElement('option');
        option.value = board.id;
        option.textContent = board.name;
        boardSelector.appendChild(option);
    });
}

function renderArchivedBoards() {
    const archivedBoards = state.boards.filter(board => board.archived);

    if (archivedBoards.length === 0) {
        archivedBoardsList.innerHTML = '<div class="archived-boards-empty">No archived boards</div>';
        return;
    }

    archivedBoardsList.innerHTML = '';
    archivedBoards.forEach(board => {
        const item = document.createElement('div');
        item.className = 'archived-board-item';
        item.innerHTML = `
            <div class="archived-board-name">${board.name}</div>
            <div class="archived-board-actions">
                <button class="btn btn-small btn-secondary" onclick="unarchiveBoard('${board.id}')">Unarchive</button>
                <button class="btn btn-small btn-danger" onclick="deleteArchivedBoard('${board.id}')">Delete</button>
            </div>
        `;
        archivedBoardsList.appendChild(item);
    });
}

function deleteArchivedBoard(boardId) {
    if (confirm('Are you sure you want to permanently delete this archived board?')) {
        state.boards = state.boards.filter(b => b.id !== boardId);
        saveToLocalStorage();
        renderArchivedBoards();
    }
}

// Task Feed Functions
function getAllTasks() {
    const tasks = [];
    let totalTasks = 0;
    let completedTasks = 0;

    state.boards.forEach(board => {
        if (board.archived) return; // Skip archived boards

        const boardTasks = {
            boardId: board.id,
            boardName: board.name,
            cards: []
        };

        board.columns.forEach(column => {
            column.cards.forEach(card => {
                if (card.checklist && card.checklist.length > 0) {
                    const cardTasks = {
                        cardId: card.id,
                        cardTitle: card.title,
                        columnId: column.id,
                        columnName: column.name,
                        checklist: card.checklist.map((item, index) => ({
                            ...item,
                            index
                        }))
                    };
                    boardTasks.cards.push(cardTasks);

                    // Count totals
                    totalTasks += card.checklist.length;
                    completedTasks += card.checklist.filter(item => item.checked).length;
                }
            });
        });

        if (boardTasks.cards.length > 0) {
            tasks.push(boardTasks);
        }
    });

    return {
        tasks,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks
    };
}

function renderTaskFeed() {
    const { tasks } = getAllTasks();

    // Clear content
    taskFeedContent.innerHTML = '';

    if (tasks.length === 0) {
        taskFeedContent.innerHTML = `
            <div class="task-feed-empty">
                <h4>No tasks yet</h4>
                <p>Create checklist items in your cards to see them here</p>
            </div>
        `;
        return;
    }

    // Render tasks grouped by board and card
    tasks.forEach(board => {
        const boardSection = document.createElement('div');
        boardSection.className = 'task-board-section';

        const totalBoardTasks = board.cards.reduce((sum, card) => sum + card.checklist.length, 0);
        const completedBoardTasks = board.cards.reduce((sum, card) => 
            sum + card.checklist.filter(item => item.checked).length, 0);

        boardSection.innerHTML = `
            <div class="task-board-header">
                <div class="task-board-name">${board.boardName}</div>
                <div class="task-board-count">${completedBoardTasks}/${totalBoardTasks} tasks</div>
            </div>
        `;

        board.cards.forEach(card => {
            const cardSection = document.createElement('div');
            cardSection.className = 'task-card-section';

            const cardHeader = document.createElement('div');
            cardHeader.className = 'task-card-header';
            cardHeader.innerHTML = `
                <span>${card.cardTitle}</span>
                <span class="task-card-column">${card.columnName}</span>
            `;
            cardSection.appendChild(cardHeader);

            card.checklist.forEach(item => {
                const taskItem = document.createElement('div');
                taskItem.className = 'task-item';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = item.checked;
                checkbox.dataset.boardId = board.boardId;
                checkbox.dataset.columnId = card.columnId;
                checkbox.dataset.cardId = card.cardId;
                checkbox.dataset.itemIndex = item.index;

                checkbox.addEventListener('change', (e) => {
                    toggleTaskInFeed(
                        board.boardId,
                        card.columnId,
                        card.cardId,
                        item.index,
                        e.target.checked
                    );
                });

                const taskText = document.createElement('div');
                taskText.className = `task-item-text ${item.checked ? 'completed' : ''}`;
                taskText.textContent = item.text;

                taskItem.appendChild(checkbox);
                taskItem.appendChild(taskText);
                cardSection.appendChild(taskItem);
            });

            boardSection.appendChild(cardSection);
        });

        taskFeedContent.appendChild(boardSection);
    });
}

function toggleTaskInFeed(boardId, columnId, cardId, itemIndex, checked) {
    const board = state.boards.find(b => b.id === boardId);
    if (!board) return;

    const column = board.columns.find(c => c.id === columnId);
    if (!column) return;

    const card = column.cards.find(c => c.id === cardId);
    if (!card || !card.checklist || !card.checklist[itemIndex]) return;

    // Update the checklist item
    card.checklist[itemIndex].checked = checked;
    saveToLocalStorage();

    // Re-render task feed to update stats and styling
    renderTaskFeed();

    // Only update the board view if we're currently viewing boards (not task feed)
    if (state.currentView === 'board' && state.currentBoardId === boardId) {
        renderBoard();
    }
}

function showTaskFeed() {
    state.currentView = 'taskFeed';
    emptyState.style.display = 'none';
    boardContainer.style.display = 'none';
    taskFeedContainer.style.display = 'flex';
    boardSelector.value = ''; // Clear board selection
    renderTaskFeed();
}

function showBoardView() {
    state.currentView = 'board';
    taskFeedContainer.style.display = 'none';
    renderBoard();
}

function renderBoard() {
    const board = getCurrentBoard();

    if (!board) {
        emptyState.style.display = 'flex';
        boardContainer.style.display = 'none';
        document.querySelector('.main-content').style.background = '';
        return;
    }

    emptyState.style.display = 'none';
    boardContainer.style.display = 'block';
    boardTitle.textContent = board.name;

    // Apply background
    const mainContent = document.querySelector('.main-content');
    const isDarkMode = document.body.classList.contains('dark-mode');

    if (board.background) {
        if (board.background.type === 'color') {
            // Use dark grey for default light color in dark mode
            if (isDarkMode && board.background.value === '#f1f5f9') {
                mainContent.style.background = '#374151';
            } else {
                mainContent.style.background = board.background.value;
            }
        } else if (board.background.type === 'image' || board.background.type === 'file') {
            mainContent.style.background = `url('${board.background.value}') center/cover no-repeat`;
        }
    } else {
        mainContent.style.background = isDarkMode ? '#374151' : '#f1f5f9';
    }

    columnsContainer.innerHTML = '';

    if (board.columns.length === 0) {
        columnsContainer.innerHTML = '<div class="empty-columns-state"><h3>Let\'s Add Some Columns</h3><p>Click the "+ Add Column" button to get started</p></div>';
        return;
    }

    board.columns.forEach((column, index) => {
        const columnEl = document.createElement('div');
        columnEl.className = 'column';
        columnEl.draggable = true;
        columnEl.dataset.columnId = column.id;
        columnEl.dataset.columnIndex = index;
        columnEl.innerHTML = `
            <div class="column-header">
                <h3 class="column-title">${column.name}</h3>
                <div class="column-actions">
                    <button class="column-menu-btn" data-column-id="${column.id}">⋮</button>
                    <div class="column-menu" data-column-id="${column.id}" style="display: none;">
                        <button class="column-menu-item delete-column-btn" data-column-id="${column.id}">Delete Column</button>
                    </div>
                </div>
            </div>
            <div class="cards-container" data-column-id="${column.id}">
                ${column.cards.map(card => `
                    <div class="card" draggable="true" data-card-id="${card.id}" data-column-id="${column.id}">
                        ${formatCardHtml(card)}
                    </div>
                `).join('')}
            </div>
            <button class="add-card-btn" data-column-id="${column.id}">+ Add Card</button>
        `;
        columnsContainer.appendChild(columnEl);
    });

    // Add event listeners
    document.querySelectorAll('.column-menu-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const menu = btn.nextElementSibling;
            const isOpen = menu.style.display === 'block';

            // Close all other menus
            document.querySelectorAll('.column-menu').forEach(m => m.style.display = 'none');

            // Toggle this menu
            menu.style.display = isOpen ? 'none' : 'block';
        });
    });

    document.querySelectorAll('.delete-column-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const column = getCurrentBoard().columns.find(c => c.id === btn.dataset.columnId);
            const cardCount = column ? column.cards.length : 0;
            const message = cardCount > 0
                ? `Are you sure you want to delete this column? All ${cardCount} card(s) will be deleted.`
                : 'Are you sure you want to delete this column?';

            if (confirm(message)) {
                deleteColumn(btn.dataset.columnId);
            }
        });
    });

    document.querySelectorAll('.add-card-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            openCardModal(btn.dataset.columnId);
        });
    });

    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => {
            openEditCardModal(card.dataset.columnId, card.dataset.cardId);
        });

        // Drag and drop handlers
        card.addEventListener('dragstart', (e) => {
            e.stopPropagation(); // Prevent column drag handler from interfering
            state.draggedCard = {
                cardId: card.dataset.cardId,
                columnId: card.dataset.columnId
            };
            card.classList.add('dragging');
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            document.querySelectorAll('.card').forEach(c => {
                c.classList.remove('drag-over-top', 'drag-over-bottom');
            });
            state.draggedCard = null;
        });

        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!state.draggedCard || card.dataset.cardId === state.draggedCard.cardId) {
                return;
            }

            // Remove all drag-over classes
            document.querySelectorAll('.card').forEach(c => {
                c.classList.remove('drag-over-top', 'drag-over-bottom');
            });

            // Determine if we should insert above or below this card
            const rect = card.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            const mouseY = e.clientY;

            if (mouseY < midpoint) {
                card.classList.add('drag-over-top');
            } else {
                card.classList.add('drag-over-bottom');
            }
        });

        card.addEventListener('dragleave', (e) => {
            if (!e.relatedTarget || !card.contains(e.relatedTarget)) {
                card.classList.remove('drag-over-top', 'drag-over-bottom');
            }
        });

        card.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Clean up all visual feedback
            document.querySelectorAll('.card').forEach(c => {
                c.classList.remove('drag-over-top', 'drag-over-bottom');
            });
            document.querySelectorAll('.cards-container').forEach(c => {
                c.classList.remove('drag-over');
            });

            if (!state.draggedCard || card.dataset.cardId === state.draggedCard.cardId) {
                return;
            }

            const toColumnId = card.dataset.columnId;
            const board = getCurrentBoard();
            const column = board.columns.find(c => c.id === toColumnId);
            if (!column) return;

            // Find the index of the target card
            const targetCardIndex = column.cards.findIndex(c => c.id === card.dataset.cardId);

            // Determine if we should insert before or after
            const rect = card.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            const mouseY = e.clientY;

            let insertIndex = targetCardIndex;
            if (mouseY >= midpoint) {
                insertIndex = targetCardIndex + 1;
            }

            moveCard(state.draggedCard.columnId, toColumnId, state.draggedCard.cardId, insertIndex);
        });
    });

    // Add drop zones to card containers
    document.querySelectorAll('.cards-container').forEach(container => {
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.classList.add('drag-over');
        });

        container.addEventListener('dragleave', () => {
            container.classList.remove('drag-over');
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('drag-over');

            if (state.draggedCard) {
                const toColumnId = container.dataset.columnId;
                moveCard(state.draggedCard.columnId, toColumnId, state.draggedCard.cardId);
            }
        });
    });

    // Add drag and drop handlers for columns
    document.querySelectorAll('.column').forEach(column => {
        column.addEventListener('dragstart', (e) => {
            // Only allow dragging from column header, not from cards
            if (e.target.closest('.card') || e.target.closest('.cards-container')) {
                e.preventDefault();
                return;
            }

            const columnIndex = parseInt(column.dataset.columnIndex);

            // Clear any card drag state
            state.draggedCard = null;

            state.draggedColumn = {
                columnId: column.dataset.columnId,
                columnIndex: columnIndex
            };
            column.classList.add('dragging-column');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', columnIndex);
        });

        column.addEventListener('dragend', () => {
            column.classList.remove('dragging-column');
            document.querySelectorAll('.column').forEach(col => {
                col.classList.remove('column-drag-over');
            });
            state.draggedColumn = null;
        });

        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (state.draggedColumn && !state.draggedCard &&
                column.dataset.columnId !== state.draggedColumn.columnId) {
                e.dataTransfer.dropEffect = 'move';

                // Remove drag-over from all columns
                document.querySelectorAll('.column').forEach(col => {
                    col.classList.remove('column-drag-over');
                });

                // Add to current column
                column.classList.add('column-drag-over');
            }
        });

        column.addEventListener('dragleave', (e) => {
            // Only remove if leaving the column entirely
            if (!column.contains(e.relatedTarget)) {
                column.classList.remove('column-drag-over');
            }
        });

        column.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();

            document.querySelectorAll('.column').forEach(col => {
                col.classList.remove('column-drag-over');
            });

            if (state.draggedColumn && !state.draggedCard) {
                const toIndex = parseInt(column.dataset.columnIndex);
                const fromIndex = state.draggedColumn.columnIndex;

                if (column.dataset.columnId !== state.draggedColumn.columnId) {
                    reorderColumns(fromIndex, toIndex);
                }
            }
        });
    });
}

// Modal Functions
function openBoardModal() {
    boardModal.classList.add('active');
    boardNameInput.value = '';
    boardNameInput.focus();
}

function closeBoardModal() {
    boardModal.classList.remove('active');
}

function openColumnModal() {
    columnModal.classList.add('active');
    columnNameInput.value = '';
    columnNameInput.focus();
}

function closeColumnModal() {
    columnModal.classList.remove('active');
}

function renderChecklistItems(checklist = []) {
    checklistItems.innerHTML = '';
    checklist.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'checklist-item';
        itemEl.innerHTML = `
            <input type="checkbox" ${item.checked ? 'checked' : ''} data-index="${index}">
            <input type="text" value="${item.text}" data-index="${index}" placeholder="Item text">
            <button class="checklist-item-delete" data-index="${index}">✕</button>
        `;
        checklistItems.appendChild(itemEl);
    });
}

function getChecklistFromModal() {
    const items = [];
    checklistItems.querySelectorAll('.checklist-item').forEach(itemEl => {
        const checkbox = itemEl.querySelector('input[type="checkbox"]');
        const textInput = itemEl.querySelector('input[type="text"]');
        const text = textInput.value.trim();
        if (text) {
            items.push({
                text: text,
                checked: checkbox.checked
            });
        }
    });
    return items;
}

function openCardModal(columnId) {
    state.editingCard = { columnId, cardId: null };
    cardModalTitle.textContent = 'Create New Card';
    cardTitleInput.value = '';
    cardDescInput.innerHTML = '';
    cardDueDateInput.value = '';
    renderChecklistItems([]);
    cardModal.classList.add('active');
    cardTitleInput.focus();
}

function openEditCardModal(columnId, cardId) {
    const board = getCurrentBoard();
    const column = board.columns.find(c => c.id === columnId);
    const card = column.cards.find(c => c.id === cardId);

    state.editingCard = { columnId, cardId };
    cardModalTitle.textContent = 'Edit Card';
    cardTitleInput.value = card.title;
    cardDescInput.innerHTML = card.description || '';
    cardDueDateInput.value = card.dueDate || '';
    renderChecklistItems(card.checklist || []);
    cardModal.classList.add('active');
    cardTitleInput.focus();
}

function closeCardModal() {
    cardModal.classList.remove('active');
    state.editingCard = null;
}

function openBackgroundModal() {
    const board = getCurrentBoard();
    if (!board) return;

    // Set current values
    if (board.background && board.background.type === 'color') {
        document.querySelector('input[name="bgType"][value="color"]').checked = true;
        bgColorInput.value = board.background.value;
        colorOption.style.display = 'block';
        imageOption.style.display = 'none';
        fileOption.style.display = 'none';
    } else if (board.background && board.background.type === 'image') {
        document.querySelector('input[name="bgType"][value="image"]').checked = true;
        bgImageInput.value = board.background.value;
        colorOption.style.display = 'none';
        imageOption.style.display = 'block';
        fileOption.style.display = 'none';
    } else if (board.background && board.background.type === 'file') {
        document.querySelector('input[name="bgType"][value="file"]').checked = true;
        colorOption.style.display = 'none';
        imageOption.style.display = 'none';
        fileOption.style.display = 'block';
    }

    backgroundModal.classList.add('active');
}

function closeBackgroundModal() {
    backgroundModal.classList.remove('active');
}

// Event Listeners
newBoardBtn.addEventListener('click', openBoardModal);
cancelBoardBtn.addEventListener('click', closeBoardModal);
createBoardBtn.addEventListener('click', () => {
    const name = boardNameInput.value.trim();
    if (name) {
        createBoard(name);
        closeBoardModal();
    }
});

boardSelector.addEventListener('change', (e) => {
    if (e.target.value) {
        selectBoard(e.target.value);
        showBoardView();
    }
});

addColumnBtn.addEventListener('click', openColumnModal);
cancelColumnBtn.addEventListener('click', closeColumnModal);
createColumnBtn.addEventListener('click', () => {
    const name = columnNameInput.value.trim();
    if (name) {
        createColumn(name);
        closeColumnModal();
    }
});

cancelCardBtn.addEventListener('click', closeCardModal);
saveCardBtn.addEventListener('click', () => {
    const title = cardTitleInput.value.trim();
    const description = cardDescInput.innerHTML.trim();
    const dueDate = cardDueDateInput.value;
    const checklist = getChecklistFromModal();

    if (title && state.editingCard) {
        if (state.editingCard.cardId) {
            updateCard(state.editingCard.columnId, state.editingCard.cardId, title, description, dueDate, checklist);
        } else {
            createCard(state.editingCard.columnId, title, description, dueDate, checklist);
        }
        closeCardModal();
    }
});

// Add checklist item button
addChecklistItemBtn.addEventListener('click', () => {
    const currentChecklist = getChecklistFromModal();
    currentChecklist.push({ text: '', checked: false });
    renderChecklistItems(currentChecklist);
    // Focus on the new item
    const newItem = checklistItems.lastElementChild;
    if (newItem) {
        const textInput = newItem.querySelector('input[type="text"]');
        if (textInput) textInput.focus();
    }
});

// Checklist item delete handler (delegated)
checklistItems.addEventListener('click', (e) => {
    if (e.target.classList.contains('checklist-item-delete')) {
        const index = parseInt(e.target.dataset.index);
        const currentChecklist = getChecklistFromModal();
        currentChecklist.splice(index, 1);
        renderChecklistItems(currentChecklist);
    }
});

// Settings Modal
function openSettingsModal() {
    settingsModal.classList.add('active');
}

function closeSettingsModal() {
    settingsModal.classList.remove('active');
}

settingsBtn.addEventListener('click', openSettingsModal);
closeSettingsBtn.addEventListener('click', closeSettingsModal);

settingsBackgroundBtn.addEventListener('click', () => {
    closeSettingsModal();
    openBackgroundModal();
});

settingsArchiveBtn.addEventListener('click', () => {
    if (state.currentBoardId) {
        archiveBoard(state.currentBoardId);
    }
});

settingsDeleteBtn.addEventListener('click', () => {
    if (state.currentBoardId) {
        closeSettingsModal();
        deleteBoard(state.currentBoardId);
    }
});

// Header Menu
headerMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    headerMenu.style.display = headerMenu.style.display === 'none' ? 'block' : 'none';
});

viewArchivedBtn.addEventListener('click', () => {
    headerMenu.style.display = 'none';
    renderArchivedBoards();
    archivedModal.style.display = 'flex';
});

closeArchivedBtn.addEventListener('click', () => {
    archivedModal.style.display = 'none';
});

// Task Feed View
taskFeedBtn.addEventListener('click', showTaskFeed);

// Close header menu when clicking outside
document.addEventListener('click', (e) => {
    if (!headerMenuBtn.contains(e.target) && !headerMenu.contains(e.target)) {
        headerMenu.style.display = 'none';
    }
});

// Dark Mode
function toggleDarkMode(enabled) {
    if (enabled) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
    }
    // Re-render board to update background color
    renderBoard();
}

darkModeToggle.addEventListener('change', (e) => {
    toggleDarkMode(e.target.checked);
});

cancelBackgroundBtn.addEventListener('click', closeBackgroundModal);
saveBackgroundBtn.addEventListener('click', () => {
    const bgType = document.querySelector('input[name="bgType"]:checked').value;
    let bgValue;

    if (bgType === 'color') {
        bgValue = bgColorInput.value;
        updateBoardBackground(bgType, bgValue);
        closeBackgroundModal();
    } else if (bgType === 'image') {
        bgValue = bgImageInput.value.trim();
        if (!bgValue) {
            alert('Please enter an image URL');
            return;
        }
        updateBoardBackground(bgType, bgValue);
        closeBackgroundModal();
    } else if (bgType === 'file') {
        const file = bgFileInput.files[0];
        if (!file) {
            alert('Please select an image file');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        // Compress and convert image
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Create canvas to compress image
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Limit max dimensions to reduce file size
                const maxWidth = 1920;
                const maxHeight = 1080;
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = width * ratio;
                    height = height * ratio;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to JPEG with quality 0.7 to reduce size
                bgValue = canvas.toDataURL('image/jpeg', 0.7);

                try {
                    updateBoardBackground('file', bgValue);
                    closeBackgroundModal();
                    bgFileInput.value = '';
                } catch (error) {
                    if (error.name === 'QuotaExceededError') {
                        alert('Image is too large. Please choose a smaller image.');
                    } else {
                        alert('Error saving background. Please try again.');
                    }
                }
            };
            img.onerror = () => {
                alert('Error loading image. Please try a different file.');
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            alert('Error reading file. Please try again.');
        };
        reader.readAsDataURL(file);
    }
});

// Handle background type radio button changes
document.querySelectorAll('input[name="bgType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'color') {
            colorOption.style.display = 'block';
            imageOption.style.display = 'none';
            fileOption.style.display = 'none';
        } else if (e.target.value === 'image') {
            colorOption.style.display = 'none';
            imageOption.style.display = 'block';
            fileOption.style.display = 'none';
        } else if (e.target.value === 'file') {
            colorOption.style.display = 'none';
            imageOption.style.display = 'none';
            fileOption.style.display = 'block';
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeBoardModal();
        closeColumnModal();
        closeCardModal();
        closeBackgroundModal();
        closeSettingsModal();
        archivedModal.style.display = 'none';
        headerMenu.style.display = 'none';
        // Close column menus
        document.querySelectorAll('.column-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }

    if (e.key === 'Enter' && e.ctrlKey) {
        if (boardModal.classList.contains('active')) {
            createBoardBtn.click();
        } else if (columnModal.classList.contains('active')) {
            createColumnBtn.click();
        } else if (cardModal.classList.contains('active')) {
            saveCardBtn.click();
        }
    }
});

// Close modals when clicking outside
[boardModal, columnModal, cardModal, backgroundModal, settingsModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

// Close column menus when clicking anywhere
document.addEventListener('click', (e) => {
    if (!e.target.closest('.column-menu-btn') && !e.target.closest('.column-menu')) {
        document.querySelectorAll('.column-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }
});

// Context menu for cards (right-click to delete)
document.addEventListener('contextmenu', (e) => {
    const card = e.target.closest('.card');
    if (card) {
        e.preventDefault();
        if (confirm('Delete this card?')) {
            deleteCard(card.dataset.columnId, card.dataset.cardId);
        }
    }
});

// Initialize App
loadFromLocalStorage();
updateBoardSelector();
renderBoard();

// Initialize dark mode
const darkModePreference = localStorage.getItem('darkMode');
if (darkModePreference === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeToggle.checked = true;
}
