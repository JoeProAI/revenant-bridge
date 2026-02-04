document.addEventListener('DOMContentLoaded', function() {
    const launchBtn = document.getElementById('launch');
    if (launchBtn) {
        launchBtn.addEventListener('click', function() {
            alert('Launching Revenant Bridge...');
            // Here you could integrate with the backend
        });
    }
    console.log('Maximalist UI loaded');
});