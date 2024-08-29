

let currentPage = 0;

// Zoom and Pan functionality
let scale = 1;
let originX = 0, originY = 0;
let isDragging = false;
let startX, startY, X0, Y0;
const moveThreshold = 5;
let inPreviewMode = true;

const comicImage = document.getElementById("comicImage");
const pageIndexElement = document.getElementById("pageIndex");



class Reader {
    constructor() {
        this.settingsFilePath = "settings.json";
        this.settings = {};

        this.images = [];
        this.loadImages();
        this.currentIndex = 0;

    }

    loadImages() {
        
        if (openedViaPreview) {
            this.images = localStorageManager.getArray();
            this.showPage();
        }
        else {
            loadCSVFile("comic_pages.csv", (images) => {
                this.images = images;
                this.showPage();
            });
        }
        
    }

    async loadSettings() {
        try {
            const response = await fetch(this.settingsFilePath);
            if (!response.ok) {
                throw new Error(`Failed to load settings from ${this.settingsFilePath}`);
            }
            this.settings = await response.json();
        } catch (error) {
            console.error("Error loading settings:", error);
        }
    }


    showPage() {
        comicImage.src = this.images[this.currentIndex];
        pageIndexElement.textContent = `Page ${this.currentIndex + 1} / ${this.images.length}`;
    }

    nextPage() {
        if (this.currentIndex < this.images.length - 1) {
            this.currentIndex++;
            this.showPage();
        }
    }

    previousPage() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.showPage();
        }
    }

    goToPage(index) {
        if (index >= 0 && index < this.images.length) {
            this.currentIndex = index;
            this.showPage();
        }
    }

    click(event) {
        const rect = comicImage.getBoundingClientRect();
        const x = event.clientX - rect.left;

        if (x > rect.width / 2) {
            this.nextPage();
        } else {
            this.previousPage();
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
    // console.log("X: " +movedX + ", Y: " + movedY);
    if (movedX < moveThreshold && movedY < moveThreshold) reader.click(event);
});





const reader = new Reader();
reader.showPage();


