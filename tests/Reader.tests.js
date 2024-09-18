// Import the functions or classes to be tested
import Reader from './Reader';  // Adjust the path as needed

describe('Reader Class Tests', () => {
  let reader;

  beforeEach(() => {
    // Set up the environment before each test
    reader = new Reader();
    document.body.innerHTML = `
      <div id="gallery"></div>
      <div id="infoOverlay" style="display: none;">
        <button id="closeInfoPanel"></button>
      </div>
      <input id="titleInput" value="Test Title" />
      <input id="authorInput" value="Test Author" />
      <textarea id="descriptionInput">Test Description</textarea>
      <input id="checkZoomDrag" type="checkbox" checked />
      <input id="colorPicker" value="#ffffff" />
    `;
  });

  test('should correctly initialize the Reader object', () => {
    expect(reader).toBeInstanceOf(Reader);
  });

  test('should update settings correctly', () => {
    reader.updateSettings();
    expect(reader.settings.title).toBe('Test Title');
    expect(reader.settings.author).toBe('Test Author');
    expect(reader.settings.description).toBe('Test Description');
    expect(reader.settings.canZoom).toBe(true);
    expect(reader.settings.backgroundColor).toBe('#ffffff');
  });

  test('should handle file drop and add images to the gallery', () => {
    const files = [
      new File([''], 'page1.png', { type: 'image/png' }),
      new File([''], 'page2.png', { type: 'image/png' }),
    ];
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));

    const dropEvent = new DragEvent('drop', {
      dataTransfer: dataTransfer,
    });

    document.getElementById('drop-area').dispatchEvent(dropEvent);

    // Assert that images are added to the gallery
    const gallery = document.getElementById('gallery');
    expect(gallery.children.length).toBe(files.length);
  });

  test('should remove all images from the gallery when delete button is clicked', () => {
    const gallery = document.getElementById('gallery');
    const img = document.createElement('img');
    gallery.appendChild(img);
    document.getElementById('delete-all-btn').click();

    expect(gallery.children.length).toBe(0);
  });

  // Additional tests could be added here to test other functionality

});
