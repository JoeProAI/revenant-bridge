// Basic interactivity for Revenant Bridge UI

function uploadToArweave() {
    const files = document.getElementById('files').files;
    if (files.length === 0) {
        alert('Please select files to upload.');
        return;
    }
    // TODO: Integrate with Arweave API
    console.log('Uploading files to Arweave:', files);
    alert('Files selected for upload to Arweave. (Demo)');
}

function spawnAgent() {
    const config = document.querySelector('.revival input').value;
    if (!config) {
        alert('Please enter sub-agent config.');
        return;
    }
    // TODO: Spawn sub-agent
    console.log('Spawning sub-agent with config:', config);
    alert('Sub-agent spawned. (Demo)');
}

function processPayment() {
    const currency = document.getElementById('currency').value;
    // TODO: Integrate payment gateway
    console.log('Processing payment in:', currency);
    alert(`Payment processed in ${currency}. (Demo)`);
}

// Add some dynamic effects
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    sections.forEach((sec, index) => {
        sec.style.opacity = '0';
        sec.style.transform = 'translateY(20px)';
        setTimeout(() => {
            sec.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            sec.style.opacity = '1';
            sec.style.transform = 'translateY(0)';
        }, index * 200);
    });
});