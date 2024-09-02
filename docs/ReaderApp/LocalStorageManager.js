

class LocalStorageManager {
    constructor(key) {
        this.key = key;
    }

    // Retrieve the array from localStorage
    getArray() {
        const data = localStorage.getItem(this.key);
        return data ? JSON.parse(data) : [];
    }

    getItem(index) {
        this.getArray()[index];
    }

    saveBigArray(bigArray) {
        this.clearArray();
        for (let i = 0; i < bigArray.length; i++) {
            try { this.addItem(bigArray[i]); }
            catch {
                console.log("exceeded at: " + i);
                break;
            }
            
        }
    }

    // Save the array to localStorage
    saveArray(array) {
        localStorage.setItem(this.key, JSON.stringify(array));
    }

    saveItem(obj, key) {
        localStorage.setItem(key, JSON.stringify(obj));
    }

    loadItem(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : {};
    }



    // Add an item to the array in localStorage
    addItem(newItem) {
        const array = this.getArray();
        array.push(newItem);
        this.saveArray(array);
    }

    // Remove an item from the array in localStorage
    removeItem(itemToRemove) {
        let array = this.getArray();
        array = array.filter(item => item !== itemToRemove);
        this.saveArray(array);
    }

    // Clear the array from localStorage
    clearArray() {
        localStorage.removeItem(this.key);
    }

}

const localStorageManager = new LocalStorageManager("imageURLs");