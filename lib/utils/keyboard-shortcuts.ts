import Mousetrap from 'mousetrap';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/stores/useAppStore';
import toast from 'react-hot-toast';

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'search' | 'system';
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { setGlobalSearch, performGlobalSearch } = useAppStore();

  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: 'g h',
      description: 'Go to Dashboard',
      action: () => router.push('/'),
      category: 'navigation'
    },
    {
      key: 'g p',
      description: 'Go to Projects',
      action: () => router.push('/projects'),
      category: 'navigation'
    },
    {
      key: 'g v',
      description: 'Go to VBA',
      action: () => router.push('/vba'),
      category: 'navigation'
    },
    {
      key: 'g s',
      description: 'Go to Submittals',
      action: () => router.push('/submittals'),
      category: 'navigation'
    },
    {
      key: 'g n',
      description: 'Go to Notifications',
      action: () => router.push('/notifications'),
      category: 'navigation'
    },
    {
      key: 'g o',
      description: 'Go to Organization',
      action: () => router.push('/organization'),
      category: 'navigation'
    },
    {
      key: 'g m',
      description: 'Go to Members',
      action: () => router.push('/members'),
      category: 'navigation'
    },
    {
      key: 'g a',
      description: 'Go to Architecture Analysis',
      action: () => router.push('/architecture-analysis'),
      category: 'navigation'
    },
    {
      key: 'g e',
      description: 'Go to Security Center',
      action: () => router.push('/security'),
      category: 'navigation'
    },

    // Search shortcuts
    {
      key: '/',
      description: 'Focus global search',
      action: () => {
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        } else {
          // If no search input visible, trigger global search modal
          showGlobalSearchModal();
        }
      },
      category: 'search'
    },
    {
      key: 'ctrl+k',
      description: 'Open command palette',
      action: () => showGlobalSearchModal(),
      category: 'search'
    },
    {
      key: 'cmd+k',
      description: 'Open command palette (Mac)',
      action: () => showGlobalSearchModal(),
      category: 'search'
    },

    // Action shortcuts
    {
      key: 'n',
      description: 'Create new item (context-dependent)',
      action: () => {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/vba')) {
          // Trigger new VBA project modal
          const newButton = document.querySelector('[data-new-project]') as HTMLButtonElement;
          newButton?.click();
        } else if (currentPath.includes('/projects')) {
          router.push('/submittals');
        } else {
          toast.info('Navigate to a specific section to create new items');
        }
      },
      category: 'actions'
    },
    {
      key: 'r',
      description: 'Refresh current page',
      action: () => {
        window.location.reload();
      },
      category: 'actions'
    },
    {
      key: 'ctrl+a',
      description: 'Select all items',
      action: () => {
        // Trigger select all for current page
        const selectAllButton = document.querySelector('[data-select-all]') as HTMLButtonElement;
        selectAllButton?.click();
      },
      category: 'actions'
    },
    {
      key: 'delete',
      description: 'Delete selected items',
      action: () => {
        const deleteButton = document.querySelector('[data-bulk-delete]') as HTMLButtonElement;
        if (deleteButton) {
          deleteButton.click();
        } else {
          toast.error('No items selected for deletion');
        }
      },
      category: 'actions'
    },
    {
      key: 'ctrl+e',
      description: 'Export selected items',
      action: () => {
        const exportButton = document.querySelector('[data-bulk-export]') as HTMLButtonElement;
        if (exportButton) {
          exportButton.click();
        } else {
          toast.info('Select items to export');
        }
      },
      category: 'actions'
    },

    // System shortcuts
    {
      key: '?',
      description: 'Show keyboard shortcuts help',
      action: () => showShortcutsModal(),
      category: 'system'
    },
    {
      key: 'esc',
      description: 'Close modal/cancel action',
      action: () => {
        // Close any open modals
        const modals = document.querySelectorAll('[data-modal]');
        modals.forEach(modal => {
          const closeButton = modal.querySelector('[data-modal-close]') as HTMLButtonElement;
          closeButton?.click();
        });
        
        // Clear selections
        const clearButton = document.querySelector('[data-clear-selection]') as HTMLButtonElement;
        clearButton?.click();
      },
      category: 'system'
    }
  ];

  const initializeShortcuts = () => {
    shortcuts.forEach(shortcut => {
      Mousetrap.bind(shortcut.key, (e) => {
        e.preventDefault();
        shortcut.action();
      });
    });

    // Show toast notification on first load
    toast.success('Keyboard shortcuts enabled! Press ? for help', {
      duration: 3000,
      icon: '⌨️'
    });
  };

  const destroyShortcuts = () => {
    shortcuts.forEach(shortcut => {
      Mousetrap.unbind(shortcut.key);
    });
  };

  return {
    shortcuts,
    initializeShortcuts,
    destroyShortcuts
  };
}

// Global search modal functionality
function showGlobalSearchModal() {
  const existingModal = document.getElementById('global-search-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.id = 'global-search-modal';
  modal.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50" onclick="this.remove()">
      <div class="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4" onclick="event.stopPropagation()">
        <div class="flex items-center gap-3 mb-4">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            placeholder="Search projects, inspections, documents..." 
            class="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
            id="global-search-input"
            autocomplete="off"
          />
          <span class="text-sm text-gray-400">ESC to close</span>
        </div>
        <div id="search-results" class="space-y-2 max-h-80 overflow-y-auto">
          <div class="text-gray-400 text-sm">Start typing to search...</div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  
  const input = document.getElementById('global-search-input') as HTMLInputElement;
  const resultsContainer = document.getElementById('search-results')!;
  
  input.focus();
  
  let searchTimeout: NodeJS.Timeout;
  
  input.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value;
    
    clearTimeout(searchTimeout);
    
    if (query.length < 2) {
      resultsContainer.innerHTML = '<div class="text-gray-400 text-sm">Start typing to search...</div>';
      return;
    }
    
    resultsContainer.innerHTML = '<div class="text-gray-400 text-sm">Searching...</div>';
    
    searchTimeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const { results } = await response.json();
        
        if (results.length === 0) {
          resultsContainer.innerHTML = '<div class="text-gray-400 text-sm">No results found</div>';
          return;
        }
        
        resultsContainer.innerHTML = results.map((result: any) => `
          <a href="${result.url}" class="block p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 rounded-full bg-yellow-400"></div>
              <div class="flex-1">
                <div class="font-medium text-white">${result.title}</div>
                <div class="text-sm text-gray-400">${result.description}</div>
              </div>
              <div class="text-xs text-gray-500 uppercase">${result.type}</div>
            </div>
          </a>
        `).join('');
        
      } catch (error) {
        resultsContainer.innerHTML = '<div class="text-red-400 text-sm">Search failed</div>';
      }
    }, 300);
  });
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modal.remove();
    }
  });
}

// Shortcuts help modal
function showShortcutsModal() {
  const existingModal = document.getElementById('shortcuts-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Define shortcuts directly instead of using the hook
  const shortcuts: KeyboardShortcut[] = [
    { key: '/', description: 'Search', category: 'Navigation' },
    { key: 'Ctrl+K', description: 'Command palette', category: 'Navigation' },
    { key: 'Ctrl+S', description: 'Save', category: 'General' },
    { key: 'Ctrl+Z', description: 'Undo', category: 'General' },
    { key: 'Ctrl+Y', description: 'Redo', category: 'General' },
    { key: 'Escape', description: 'Close modal/cancel', category: 'General' },
  ];

  const categories = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) acc[shortcut.category] = [];
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  const modal = document.createElement('div');
  modal.id = 'shortcuts-modal';
  modal.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="this.remove()">
      <div class="bg-gray-800 rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-yellow-400">Keyboard Shortcuts</h2>
          <button onclick="this.closest('#shortcuts-modal').remove()" class="text-gray-400 hover:text-white">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${Object.entries(categories).map(([category, shortcuts]) => `
            <div>
              <h3 class="text-lg font-semibold text-yellow-400 mb-3 capitalize">${category}</h3>
              <div class="space-y-2">
                ${shortcuts.map(shortcut => `
                  <div class="flex items-center justify-between py-2 border-b border-gray-700">
                    <span class="text-gray-300">${shortcut.description}</span>
                    <kbd class="px-2 py-1 bg-gray-700 rounded text-sm text-yellow-400 font-mono">
                      ${shortcut.key}
                    </kbd>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="mt-6 text-center">
          <span class="text-gray-400 text-sm">Press ESC to close</span>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}