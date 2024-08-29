

let currentPage = 0;

// Zoom and Pan functionality
let scale = 1;
let originX = 0, originY = 0;
let isDragging = false;
let startX, startY, X0, Y0;
const moveThreshold = 5;



const comicImage = document.getElementById("comicImage");
const pageIndexElement = document.getElementById("pageIndex");


function Start() {
    showPage(0);
}

function showPage(index) {
    if (index > comicImages.length -1) return;
    if (index < 0) return;

    comicImage.src = comicImages[index];
    pageIndexElement.textContent = `Page ${index + 1} / ${comicImages.length}`;
}



function Click(event) {
    const rect = comicImage.getBoundingClientRect();
    const x = event.clientX - rect.left;

    if (x > rect.width / 2) {
        // Clicked on the right side, go to the next page
        if (currentPage < comicImages.length - 1) {
            currentPage++;
            showPage(currentPage);
        }
    } else {
        // Clicked on the left side, go to the previous page
        if (currentPage > 0) {
            currentPage--;
            showPage(currentPage);
        }
    }
}



// ZOOOOOM

// Prevent the default drag behavior
comicImage.addEventListener("dragstart", (event) => {
    event.preventDefault();
});

comicImage.addEventListener("wheel", (event) => {
    event.preventDefault();
    const zoomFactor = 0.1;
    if (event.deltaY < 0) {
        scale = Math.min(scale + zoomFactor, 3); // Max scale
    } else {
        scale = Math.max(scale - zoomFactor, 1); // Min scale
    }
    comicImage.style.transform = `scale(${scale}) translate(${originX}px, ${originY}px)`;
});

comicImage.addEventListener("mousedown", (event) => {
    event.preventDefault(); // Prevent default behavior
    isDragging = true;
    startX = event.clientX - originX;
    startY = event.clientY - originY;
    X0 = event.clientX;
    Y0 = event.clientY;
});

document.addEventListener("mousemove", (event) => {
    if (isDragging) {
        originX = event.clientX - startX;
        originY = event.clientY - startY;
        comicImage.style.transform = `scale(${scale}) translate(${originX}px, ${originY}px)`;
    }
});

document.addEventListener("mouseup", (event) => {
    isDragging = false;
    const movedX = Math.abs(event.clientX - X0);
    const movedY = Math.abs(event.clientY - Y0);
    console.log("X: " +movedX + ", Y: " + movedY);
    if (movedX < moveThreshold && movedY < moveThreshold) Click(event);
});





Start();
