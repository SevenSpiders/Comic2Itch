

let comicImages = [];

// Function to fetch and parse the CSV file
function loadCSVFile(filePath, callback) {
    fetch(filePath)
        .then(response => response.text())
        .then(text => {
            // const rows = text.split('\n').filter(row => row.trim() !== '');
            comicImages = text.split('\n').filter(row => row.trim() !== '');
            if (callback) callback(comicImages);
        })
        .catch(error => console.error('Error loading CSV file:', error));
}

// Function to handle the loaded CSV data
function handleCSVData(rows) {
    // console.log('Comic pages:', rows);
}

// Load the CSV file and handle the data
loadCSVFile('comic_pages.csv', handleCSVData);
