// Enhanced Search with Autocomplete
class EnhancedSearch {
    constructor(options) {
        this.container = document.querySelector(options.container);
        this.input = this.container.querySelector('input');
        this.searchData = options.data || [];
        this.onSearch = options.onSearch || (() => {});
        this.onSelect = options.onSelect || (() => {});
        this.placeholder = options.placeholder || 'Search...';
        this.minChars = options.minChars || 2;
        
        this.dropdown = null;
        this.highlightedIndex = -1;
        this.filteredResults = [];
        
        this.init();
    }
    
    init() {
        this.createSearchBox();
        this.attachEventListeners();
    }
    
    createSearchBox() {
        this.container.innerHTML = `
            <div class="search-box-enhanced">
                <i class="fas fa-search search-icon"></i>
                <input type="text" placeholder="${this.placeholder}" autocomplete="off">
            </div>
        `;
        
        this.input = this.container.querySelector('input');
    }
    
    attachEventListeners() {
        this.input.addEventListener('input', this.handleInput.bind(this));
        this.input.addEventListener('keydown', this.handleKeydown.bind(this));
        this.input.addEventListener('focus', this.handleFocus.bind(this));
        this.input.addEventListener('blur', this.handleBlur.bind(this));
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.hideDropdown();
            }
        });
    }
    
    handleInput(e) {
        const query = e.target.value.trim();
        
        if (query.length >= this.minChars) {
            this.search(query);
        } else {
            this.hideDropdown();
        }
        
        // Call the search callback
        this.onSearch(query);
    }
    
    handleKeydown(e) {
        if (!this.dropdown) return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.highlightNext();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.highlightPrevious();
                break;
            case 'Enter':
                e.preventDefault();
                this.selectHighlighted();
                break;
            case 'Escape':
                this.hideDropdown();
                this.input.blur();
                break;
        }
    }
    
    handleFocus() {
        if (this.input.value.length >= this.minChars) {
            this.search(this.input.value);
        }
    }
    
    handleBlur() {
        // Delay hiding to allow for clicks on dropdown items
        setTimeout(() => {
            this.hideDropdown();
        }, 150);
    }
    
    search(query) {
        this.filteredResults = this.searchData.filter(item => {
            const searchText = `${item.name} ${item.email || ''} ${item.phoneNumber || ''} ${item.courses || ''}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });
        
        this.showDropdown();
    }
    
    showDropdown() {
        if (this.filteredResults.length === 0) {
            this.hideDropdown();
            return;
        }
        
        if (!this.dropdown) {
            this.dropdown = document.createElement('div');
            this.dropdown.className = 'autocomplete-dropdown';
            this.container.appendChild(this.dropdown);
        }
        
        this.dropdown.innerHTML = this.filteredResults.map((item, index) => `
            <div class="autocomplete-item" data-index="${index}">
                <div class="item-title">${this.highlightMatch(item.name, this.input.value)}</div>
                <div class="item-subtitle">
                    ${item.email || ''} ${item.phoneNumber ? '• ' + item.phoneNumber : ''} ${item.courses ? '• ' + item.courses : ''}
                </div>
            </div>
        `).join('');
        
        // Add click listeners to dropdown items
        this.dropdown.querySelectorAll('.autocomplete-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.selectItem(index);
            });
        });
        
        this.highlightedIndex = -1;
    }
    
    hideDropdown() {
        if (this.dropdown) {
            this.dropdown.remove();
            this.dropdown = null;
        }
        this.highlightedIndex = -1;
    }
    
    highlightNext() {
        this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.filteredResults.length - 1);
        this.updateHighlight();
    }
    
    highlightPrevious() {
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1);
        this.updateHighlight();
    }
    
    updateHighlight() {
        if (!this.dropdown) return;
        
        this.dropdown.querySelectorAll('.autocomplete-item').forEach((item, index) => {
            item.classList.toggle('highlighted', index === this.highlightedIndex);
        });
    }
    
    selectHighlighted() {
        if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredResults.length) {
            this.selectItem(this.highlightedIndex);
        }
    }
    
    selectItem(index) {
        const selectedItem = this.filteredResults[index];
        this.input.value = selectedItem.name;
        this.hideDropdown();
        this.onSelect(selectedItem);
    }
    
    highlightMatch(text, query) {
        if (!query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }
    
    updateData(newData) {
        this.searchData = newData;
    }
    
    clear() {
        this.input.value = '';
        this.hideDropdown();
    }
}

// Export for use in other files
window.EnhancedSearch = EnhancedSearch;