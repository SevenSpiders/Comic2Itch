// Handle file drop
document.getElementById('drop-area').addEventListener('dragover', (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
});

document.getElementById('drop-area').addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    handleFiles(files);
});

// Handle file selection
function handleFiles(files) {
    const gallery = document.getElementById('gallery');
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.dataset.name = file.name; // Store original file name
                gallery.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    }
}

// Initialize sortable functionality
const sortable = Sortable.create(document.getElementById('gallery'), {
    animation: 150,
    ghostClass: 'sortable-placeholder'
});

function readFileAsString(filePath, callback) {
    fetch(filePath)
        .then(response => response.text())
        .then(text => callback(text))
        .catch(error => console.error('Error reading file:', error));
}















// Handle ZIP download
document.getElementById('download-btn').addEventListener('click', () => {
    const zip = new JSZip();
    const images = document.querySelectorAll('#gallery img');
    let pagePaths = "";

    images.forEach((img, index) => {
        const imgData = img.src.split(',')[1]; // Get base64 data
        const extension = img.src.split(';')[0].split('/')[1]; // Get image extension
        const imgName = `page_${index + 1}.${extension}`;
        zip.file(`images/${imgName}`, imgData, { base64: true });
        pagePaths += `images/${imgName}`;
        if (index < images.length -1) pagePaths += '\n';
    });

    zip.file('comic_pages.csv', pagePaths);

    readFileAsString('ReaderApp/index.html', (indexHtml) => {
        zip.file('index.html', indexHtml);
    });

    readFileAsString('ReaderApp/styles.css', (stylesCSS) => {
        zip.file('styles.css', stylesCSS);
    });

    readFileAsString('ReaderApp/PageLoader.js', (pageLoaderJs) => {
        zip.file('PageLoader.js', pageLoaderJs);
    });

    readFileAsString('ReaderApp/Reader.js', (readerJs) => {
        zip.file('Reader.js', readerJs);

        zip.generateAsync({ type: 'blob' })
            .then((content) => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(content);
                a.download = 'itchComic.zip';
                a.click();
        });
    });

    
});
