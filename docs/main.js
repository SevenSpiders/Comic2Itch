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

document.getElementById('delete-all-btn').addEventListener('click', () => {
    const gallery = document.getElementById('gallery');
    while (gallery.firstChild) {
        gallery.removeChild(gallery.firstChild);
    }
});


function getImages() {
    let images = document.querySelectorAll('#gallery img');
    let imageSources = [];
    images.forEach(element => {
        imageSources.push(element.src);
    });
    return imageSources;
}



document.getElementById('preview-btn').addEventListener('click', () => {
    localStorageManager.saveBigArray(getImages());
    window.open('ReaderApp/index.html?source=previewButton', '_blank');
});


// Handle file selection
function handleFiles(files) {
    // if (isBusy) return; // => fix bug where one of the elements is not a image
    
    galleryIndex = 0;
    imageBuffer = [];
    
    // sort files alphabetically and by base ("page11" > "page2")
    files = Array.from(files).sort((a, b) => {
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });

    const gallery = document.getElementById('gallery');
    for (let i = 0; i < files.length; i++) {
        
        const file = files[i];
        if (file.type.startsWith('image/')) {
            imageBuffer.push(null);
            isBusy = true;
            const reader = new FileReader();
            reader.onload = (e) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'image-wrapper';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.dataset.name = file.name;
                img.size = file.size;
                
                const title = document.createElement('div');
                title.className = "image-title";
                title.innerText = files[i].name;

                const deleteBtn = document.createElement('button');
                deleteBtn.innerText = 'X';
                deleteBtn.className = 'delete-btn';
                deleteBtn.addEventListener('click', () => {
                    gallery.removeChild(wrapper);
                });

                wrapper.appendChild(img);
                wrapper.appendChild(title);
                wrapper.appendChild(deleteBtn);
                AddToGallery(wrapper, i);
            };
            reader.readAsDataURL(file);
        }
    }
}



let imageBuffer = []
let galleryIndex = 0;
let isBusy = false;

function AddToGallery(image, index) {
    const gallery = document.getElementById('gallery');
    
    if (index == galleryIndex) {
        gallery.appendChild(image);
        galleryIndex += 1;

        // check buffer
        if (galleryIndex >= imageBuffer.length) {
            // console.log("added images");
            // galleryIndex = 0;
            // imageBuffer = [];
            UpdateSizeEstimate();
            isBusy = false;
            return;
        }
        if (imageBuffer[galleryIndex] != null) AddToGallery(imageBuffer[galleryIndex], galleryIndex);
    }

    else {
        imageBuffer[index] = image;
    }
    
}

// Initialize sortable functionality
const sortable = Sortable.create(document.getElementById('gallery'), {
    animation: 150,
    ghostClass: 'sortable-placeholder'
});


function getTotalSize() {
    let totalSize = 0;
    let images = document.querySelectorAll('#gallery img');
    images.forEach(element => {
        totalSize += element.size;
    });
    return totalSize/1000000;
}

function UpdateSizeEstimate() {
    const size = getTotalSize().toFixed(2);
    const p = document.getElementById('size-estimate');
    p.innerText = "(size: "+size+"MB)";
}






// ------------ DOWNLOAD -------------------------------------------


function readFileAsString(filePath, callback) {
    return fetch(filePath)
        .then(response => response.text())
        .then(text => callback(text))
        .catch(error => console.error('Error reading file:', error));
}

async function readImage(filePath, callback) {
    return fetch(filePath)
        .then(response => response.blob())
        .then(f => callback(f))
        .catch(error => console.error('Error reading file:', error));
}


function package(zip, fileName, filePath = "", isImage = false) {
    let callback = (f) => {
        zip.file(filePath + fileName, f);
    }

    if (isImage) return readImage('ReaderApp/' + filePath + fileName, callback);
    else return readFileAsString('ReaderApp/' + filePath + fileName, callback);
}




function Download() {
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
    
    // Create an array of promises for each packaging operation
    const promises = [
        package(zip, 'Reader.js'),
        package(zip, 'settings.json'),
        package(zip, 'PageLoader.js'),
        package(zip, 'LocalStorageManager.js'),
        package(zip, 'styles.css'),
        package(zip, 'index.html'),
        package(zip, 'arrowIcon.png', 'UIAssets/', true),
        package(zip, 'resetIcon.png', 'UIAssets/', true),
        package(zip, 'warningIcon.png', 'UIAssets/', true),
        package(zip, 'fullScreenIcon.png', 'UIAssets/', true),
        package(zip, 'favicon-16x16.png', 'favicon/', true),
        package(zip, 'favicon-32x32.png', 'favicon/', true),
        package(zip, 'favicon.ico', 'favicon/', true)
    ];

    Promise.all(promises).then(() => {
        console.log("All files have been packaged and zipped.");
        
        // Now you can continue with the zip file, e.g., save or download it
        zip.generateAsync({ type: 'blob' })
            .then((content) => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(content);
                a.download = 'itchComic.zip';
                a.click();
        });
    }).catch(error => {
        console.error('Error packaging files:', error);
    });
}

document.getElementById('download-btn').addEventListener('click', Download );


// Handle ZIP download
// document.getElementById('download-btn').addEventListener('click', () => {
//     const zip = new JSZip();
//     const images = document.querySelectorAll('#gallery img');
//     let pagePaths = "";

//     images.forEach((img, index) => {
//         const imgData = img.src.split(',')[1]; // Get base64 data
//         const extension = img.src.split(';')[0].split('/')[1]; // Get image extension
//         const imgName = `page_${index + 1}.${extension}`;
//         zip.file(`images/${imgName}`, imgData, { base64: true });
//         pagePaths += `images/${imgName}`;
//         if (index < images.length -1) pagePaths += '\n';
//     });

//     zip.file('comic_pages.csv', pagePaths);


//     package(zip, 'settings.json');
//     package(zip, 'PageLoader.js');
//     package(zip, 'LocalStorageManager.js');
//     package(zip, 'styles.css');
//     package(zip, 'index.html');
//     package(zip, 'arrowIcon.png', 'UIAssets/');
//     package(zip, 'resetIcon.png', 'UIAssets/');
//     package(zip, 'warningIcon.png', 'UIAssets/');
//     package(zip, 'favicon-16x16.png', 'favicon/');
//     package(zip, 'favicon-32x32.png', 'favicon/');
//     package(zip, 'favicon.ico', 'favicon/');


//     readFileAsString('ReaderApp/Reader.js', (readerJs) => {
//         zip.file('Reader.js', readerJs);

        
//     });


//     zip.generateAsync({ type: 'blob' })
//             .then((content) => {
//                 const a = document.createElement('a');
//                 a.href = URL.createObjectURL(content);
//                 a.download = 'itchComic.zip';
//                 a.click();
//         });

    
    
// });

