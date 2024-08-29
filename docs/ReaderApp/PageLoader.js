
const urlParams = new URLSearchParams(window.location.search);
const openedViaPreview = urlParams.get('source') === 'previewButton';

// Function to fetch and parse the CSV file
function loadCSVFile(filePath, callback) {
    fetch(filePath)
        .then(response => response.text())
        .then(text => {
            let comicImages = text.split('\n').filter(row => row.trim() !== '');
            if (callback) callback(comicImages);
        })
        .catch(error => console.error('Error loading CSV file:', error));
}


