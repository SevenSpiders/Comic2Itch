let settings = {}

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


function loadSettings() {
    fetch("settings.json")
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse the JSON file into a JavaScript object
        })
        .then(data => {
            settings = data;
        })
        .catch(error => {
            console.error("There was a problem with the fetch operation:", error);
        });
}

loadSettings();
