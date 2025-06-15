document.addEventListener('DOMContentLoaded', function() {
    // Initialize any client-side functionality
    console.log('DWAG app initialized');
    
    // Handle task completion toggles
    document.querySelectorAll('.task-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            this.closest('.task-item').classList.toggle('completed');
        });
    });
    
    // Handle custom category display
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            const customGroup = document.getElementById('custom-category-group');
            if (this.value === 'CUSTOM') {
                customGroup.style.display = 'block';
            } else {
                customGroup.style.display = 'none';
            }
        });
    }
});