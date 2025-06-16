document.addEventListener('DOMContentLoaded', function() {
    // Template task click handler
    document.querySelectorAll('.template-category li').forEach(item => {
        item.addEventListener('click', function() {
            const category = this.closest('.template-category').querySelector('h4').textContent;
            const taskText = this.textContent;
            
            document.getElementById('title').value = taskText;
            document.getElementById('category').value = category.toUpperCase();
            
            // Scroll to form
            document.getElementById('title').scrollIntoView({ behavior: 'smooth' });
            document.getElementById('title').focus();
        });
    });
    
    // Task completion animation
    document.querySelectorAll('.task-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const form = this;
            const taskItem = form.closest('.task-item');
            
            fetch(form.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: new URLSearchParams(new FormData(form))
            })
            .then(response => {
                if (response.ok) {
                    taskItem.classList.toggle('completed');
                    return response.text();
                }
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                // Handle success
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });
});