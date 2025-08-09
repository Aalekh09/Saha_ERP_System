/**
 * Reusable Pagination Utility
 * Provides pagination functionality for tables
 */

class TablePagination {
    constructor(options) {
        this.containerId = options.containerId;
        this.tableId = options.tableId;
        this.data = options.data || [];
        this.pageSize = options.pageSize || 10;
        this.currentPage = 1;
        this.renderRow = options.renderRow;
        this.onPageChange = options.onPageChange;
        this.searchFilter = options.searchFilter;
        this.filteredData = [...this.data];
        
        this.init();
    }
    
    init() {
        this.createPaginationContainer();
        this.render();
    }
    
    createPaginationContainer() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        // Wrap existing table in table-wrapper if not already wrapped
        const tableContainer = container.querySelector('.table-container');
        if (tableContainer) {
            const table = tableContainer.querySelector('table');
            if (table && !table.parentElement.classList.contains('table-wrapper')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-wrapper';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        }
        
        // Create pagination container if it doesn't exist
        let paginationContainer = container.querySelector('.pagination-container');
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.className = 'pagination-container';
            paginationContainer.innerHTML = `
                <div class="pagination-info">
                    <span id="${this.containerId}-info">Showing 0 of 0 entries</span>
                </div>
                <div class="pagination-controls-wrapper">
                    <div class="pagination-controls" id="${this.containerId}-controls">
                        <!-- Pagination buttons will be inserted here -->
                    </div>
                    <div class="page-size-selector">
                        <label for="${this.containerId}-pageSize">Show:</label>
                        <select id="${this.containerId}-pageSize">
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                        <span>entries</span>
                    </div>
                </div>
            `;
            
            // Append to table container if it exists, otherwise to main container
            if (tableContainer) {
                tableContainer.appendChild(paginationContainer);
            } else {
                container.appendChild(paginationContainer);
            }
            
            // Add event listener for page size change
            const pageSizeSelect = document.getElementById(`${this.containerId}-pageSize`);
            pageSizeSelect.value = this.pageSize;
            pageSizeSelect.addEventListener('change', (e) => {
                this.pageSize = parseInt(e.target.value);
                this.currentPage = 1;
                this.render();
            });
        }
    }
    
    updateData(newData) {
        this.data = newData;
        this.applyFilter();
        this.currentPage = 1;
        this.render();
    }
    
    applyFilter(searchTerm = '') {
        if (this.searchFilter && searchTerm) {
            this.filteredData = this.data.filter(item => this.searchFilter(item, searchTerm));
        } else {
            this.filteredData = [...this.data];
        }
    }
    
    getTotalPages() {
        return Math.ceil(this.filteredData.length / this.pageSize);
    }
    
    getCurrentPageData() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return this.filteredData.slice(startIndex, endIndex);
    }
    
    goToPage(page) {
        const totalPages = this.getTotalPages();
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.render();
            if (this.onPageChange) {
                this.onPageChange(page, this.getCurrentPageData());
            }
        }
    }
    
    render() {
        this.renderTable();
        this.renderPaginationControls();
        this.updatePaginationInfo();
    }
    
    renderTable() {
        const table = document.getElementById(this.tableId);
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        
        const currentData = this.getCurrentPageData();
        
        if (currentData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="100%" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                            <i class="fas fa-inbox" style="font-size: 48px; color: var(--border-color);"></i>
                            <p style="margin: 0; font-weight: 600;">No data available</p>
                            <p style="margin: 0; font-size: 14px;">There are no records to display</p>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = currentData.map((item, index) => {
                const globalIndex = (this.currentPage - 1) * this.pageSize + index;
                return this.renderRow(item, globalIndex);
            }).join('');
        }
    }
    
    renderPaginationControls() {
        const controlsContainer = document.getElementById(`${this.containerId}-controls`);
        if (!controlsContainer) return;
        
        const totalPages = this.getTotalPages();
        
        if (totalPages <= 1) {
            controlsContainer.innerHTML = '';
            return;
        }
        
        let html = '';
        
        // Previous button
        html += `
            <button class="pagination-btn prev" ${this.currentPage === 1 ? 'disabled' : ''} data-page="${this.currentPage - 1}">
                <i class="fas fa-chevron-left"></i>
                <span>Previous</span>
            </button>
        `;
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // First page and ellipsis
        if (startPage > 1) {
            html += `<button class="pagination-btn page-number" data-page="1">1</button>`;
            if (startPage > 2) {
                html += `<span class="pagination-ellipsis">...</span>`;
            }
        }
        
        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button class="pagination-btn page-number ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        }
        
        // Last page and ellipsis
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<span class="pagination-ellipsis">...</span>`;
            }
            html += `<button class="pagination-btn page-number" data-page="${totalPages}">${totalPages}</button>`;
        }
        
        // Next button
        html += `
            <button class="pagination-btn next" ${this.currentPage === totalPages ? 'disabled' : ''} data-page="${this.currentPage + 1}">
                <span>Next</span>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        controlsContainer.innerHTML = html;
        
        // Add event listeners to all pagination buttons
        this.addPaginationEventListeners();
    }
    
    addPaginationEventListeners() {
        const controlsContainer = document.getElementById(`${this.containerId}-controls`);
        if (!controlsContainer) return;
        
        // Add event listeners to all pagination buttons
        controlsContainer.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(btn.getAttribute('data-page'));
                if (!isNaN(page) && !btn.disabled) {
                    this.goToPage(page);
                }
            });
        });
    }
    
    updatePaginationInfo() {
        const infoElement = document.getElementById(`${this.containerId}-info`);
        if (!infoElement) return;
        
        const totalItems = this.filteredData.length;
        const startItem = totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
        const endItem = Math.min(this.currentPage * this.pageSize, totalItems);
        
        infoElement.textContent = `Showing ${startItem} to ${endItem} of ${totalItems} entries`;
    }
    
    search(searchTerm) {
        this.applyFilter(searchTerm);
        this.currentPage = 1;
        this.render();
    }
}

// Export for use in other files
window.TablePagination = TablePagination;