
const background = document.getElementById("background");
const comicImage = document.getElementById("comicImage");
const pageIndexElement = document.getElementById("pageIndex");
const arrowLeft = document.getElementsByClassName("arrow left")[0];
const arrowRight = document.getElementsByClassName("arrow right")[0];

document.addEventListener('keydown', function(event) {
    switch(event.key) {
        case 'a':
        case 'A':
        case 'ArrowLeft':
            reader.previousPage();
            break;

        case ' ':
        case 'D':
        case 'd':
        case 'ArrowRight':
            reader.nextPage();
            break;
        case 'r':
        case 'R':
            reader.resetPage();
            break;
        case 'f':
        case 'F':
            reader.fullScreen();
            break;
        default:
            break;
    }
});



const iframe = document.getElementById('game_drop');
comicImage.addEventListener('click', function() {
    window.focus(); // Refocus the iframe content when the image is clicked
});



class Reader {
    constructor() {

        this.images = [];
        this.imageElements = []; // preloaded image elements
        this.currentIndex = 0;


        this.loadImages();

        this.moveThreshold = 5;
        this.comicImage = document.getElementById("comicImage");
        this.pageIndexElement = document.getElementById("pageIndex");
        this.pageIndexElement.addEventListener('click', () => this.togglePageSelection());
        this.comicImage.addEventListener("dragstart", (event) => {
            event.preventDefault();
        });
        
        this.resetPage();
        comicImage.addEventListener('wheel', (event) => this.handleInputScroll(event));
        comicImage.addEventListener('mousedown', (event) => this.handleMouseDown(event));
        // comicImage.addEventListener('mousemove', (event) => this.handleDrag(event));
        document.getElementById("container").onmousemove = (event) => this.handleDrag(event);

        background.onclick = (event) => this.click(event);
        comicImage.addEventListener('mouseup', (event) => this.handleMouseUp(event));
        document.getElementById("resetIcon").addEventListener('click',() => this.showPage());
        document.getElementById("fullScreenIcon").addEventListener('click', () => this.fullScreen());

        arrowLeft.addEventListener('click', () => this.previousPage());
        arrowRight.addEventListener('click', () => this.nextPage());
        document.getElementById('infoIcon').addEventListener('click', (event) => this.showInfoPanel(event));
        document.getElementById('closeInfoPanel').addEventListener('click', () => this.hideInfoPanel());
        document.getElementById('infoOverlay').addEventListener('click', () => this.hideInfoPanel());

        this.updateBackground();
    }

    loadImages() {
        
        if (checkIfOpenedInPreview()) {
            this.images = localStorageManager.getArray();
            this.populatePageSelection();
            this.preloadImages();
            this.showPage();
        }
        else {
            loadCSVFile("images/comic_pages.csv", (images, imageFlags) => {
                this.images = images;
                this.imageFlags = imageFlags;
                this.populatePageSelection();
                this.preloadImages();
                this.showPage();
            });
        }
        
    }

    preloadImages() {
        this.images.forEach((src, index) => {
            const img = new Image();
            img.src = src;
            this.imageElements[index] = img;
        });
    }


    showPage() {
        this.resetPage();
        // comicImage.src = this.images[this.currentIndex];
        if (this.currentIndex < this.imageElements.length && this.currentIndex >= 0) {
            comicImage.src = this.imageElements[this.currentIndex].src;
        }
        else if (this.currentIndex < this.images.length && this.currentIndex >= 0) {
            comicImage.src = this.images[this.currentIndex];
        }
        else {
            console.error("Could not load " + this.currentIndex);
            comicImage.src = "images/placeHolder.png"
        }

        pageIndexElement.innerText = `Page ${this.currentIndex + 1} / ${this.images.length}`;
        this.resetPage();
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

        if (x > rect.width / 2) { this.nextPage();} 
        else { this.previousPage(); }
    }

    handleInputScroll(event) {
        if (!settings.canZoom) return;
        event.preventDefault();
        const zoomFactor = 0.2;
        if (event.deltaY < 0) {
            this.scale = Math.min(this.scale + zoomFactor, 3); // Max scale
        } else {
            this.scale = Math.max(this.scale - zoomFactor, 1); // Min scale
        }
        this.comicImage.style.transform = `scale(${this.scale}) translate(${this.originX}px, ${this.originY}px)`;
    }

    
    handleMouseDown(event) {
        event.preventDefault(); // Prevent default behavior

        this.isDragging = true;
        this.startX = event.clientX - this.originX;
        this.startY = event.clientY - this.originY;
        this.X0 = event.clientX;
        this.Y0 = event.clientY;
    }

    handleDrag(event) {
        if (!this.isDragging) return;
        
        this.originX = event.clientX - this.startX;
        this.originY = event.clientY - this.startY;
        this.updateTransform();
    }

    updateTransform() {
        const _scale = settings.canZoom ? this.scale : 1;
        const _oX = settings.canDrag ? this.originX : 0;
        const _oY = settings.canDrag ? this.originY : 0;
        comicImage.style.transform = `scale(${_scale}) translate(${_oX}px, ${_oY}px)`;
    }


    handleMouseUp(event) {
        this.isDragging = false;
        const movedX = Math.abs(event.clientX - this.X0);
        const movedY = Math.abs(event.clientY - this.Y0);
        // console.log("X: " +movedX + ", Y: " + movedY);
        if (movedX < this.moveThreshold && movedY < this.moveThreshold) this.click(event);
        // event.stopPropagation();
    }

    resetPage() {
        comicImage.style.transform = 'scale(1) translate(0px, 0px)';
        this.scale = 1;
        this.isDragging = false;
        this.originX = 0;
        this.originY = 0;
        this.startX = 0;
        this.startY = 0;
        this.X0 = 0;
        this.Y0 = 0;
    }

    fullScreen() {
        const container = document.getElementById("container");
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            container.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        }
    };


    showInfoPanel(event) {
        document.getElementById('comicTitle').textContent = settings.title || 'Comic Title';
        document.getElementById('comicAuthor').textContent = `by ${settings.author || 'Unknown'}`;
        document.getElementById('comicDescription').textContent = settings.description || 'No description available.';
        document.getElementById('versionID').textContent = "v " + settings.versionID || 0.1;

        infoOverlay.style.display = 'flex';
        // event.stopPropagation();
    }

    hideInfoPanel() {
        infoOverlay.style.display = 'none';
    }

    updateBackground() {
        document.body.style.backgroundColor = settings.backgroundColor || "black";
    }

    togglePageSelection() {
        const menu = document.getElementById('page-select-menu');
        if (menu.style.display === "none" || menu.style.display === "") {
            menu.style.display = "block";
        } else {
            menu.style.display = "none";
        }
    }

    populatePageSelection() {
        const menu = document.getElementById('page-select-menu');
        menu.innerText = "";
        for (let i = 0; i < this.images.length; i++) {
            const div = document.createElement('div');
            div.className = "page-select-item";
            div.innerText = "Page " + (i+1);
            div.onclick = () => this.goToPage(i);
            menu.appendChild(div);
        }
    }
}






const reader = new Reader();