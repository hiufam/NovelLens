import { convertDocToHtml } from 'apis/conversion';
import { home } from 'views/home';

export class DocViewer {
  #highlightTimeOutFuncId = undefined;

  constructor(container) {
    this.container = container;
    this.init(container);
  }

  init() {
    this.#highlightTimeOutFuncId = undefined
    this.docPicker = this.container.querySelector('.doc-picker');
    this.docViewerBody = this.container.querySelector('.doc-viewer-body');

    this.docPicker.onchange = (e) => this.#handleDocPickerChange(e);
  }

  async #handleDocPickerChange(e) {    
    const files = e.target.files;  
    const images = [];
  
    const formData = new FormData();
    formData.append("file", files[0]);
    
    const data = await convertDocToHtml(formData);

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(data.html, 'text/html');    
    const based64media = data.media;

    // https://stackoverflow.com/questions/27239719/how-to-create-binary-blob-from-atob-currently-getting-different-bytes
    var binary = atob(based64media)
    var array = new Uint8Array(binary.length)
    for( var i = 0; i < binary.length; i++ ) { array[i] = binary.charCodeAt(i) }
    const blob = new Blob([array])

    // get all entries from the zip
    try {      
      const reader = new zip.ZipReader(new zip.BlobReader(blob));
      const entries = await reader.getEntries();

      if (entries.length) {
        const blobs = await Promise.all(entries.map((entry, index) => {          
          const imageId = entry.filename.split("/")[1].split(".")[0] // Ex: "media/image1.jpeg"
          
          return entry.getData(new zip.BlobWriter() , {
            onend: () => {              
              images.push({
                id: imageId,
                entryIndex: index,
                name: entry.filename,
              });        
            }
          });
        }));

        images.forEach((image) => {
          const blob = blobs[image.entryIndex];
          const url = URL.createObjectURL(blob);
          image.url = url;
        });
      }

      // close the ZipReader
      await reader.close();
    } catch (error) {
      console.log(error);      
    }

    
    this.docViewerBody.innerHTML = htmlDoc.getElementsByTagName('body')[0].innerHTML;  
    
    // Update doc images with new sources
    images.forEach((image) => {      
      const imageElement = this.docViewerBody.querySelector(`#${image.id}`);
      imageElement.src = image.url;
    })    

    // Add highlight event only when mouse is over document
    const selectEvent = this.#hightlightTextEvent.bind(this);

    document.addEventListener('selectionchange', selectEvent);

    this.docViewerBody.addEventListener('mouseenter', () => {
      document.addEventListener('selectionchange', selectEvent);
    });

    this.docViewerBody.addEventListener('mouseleave', () => {      
      document.removeEventListener('selectionchange', selectEvent);
    });
  }

  #hightlightTextEvent() {
    const selection = window.getSelection();
    
    if (selection && selection.rangeCount > 0 && selection.toString().length > 0) {
      if (this.#highlightTimeOutFuncId) clearTimeout(this.#highlightTimeOutFuncId);
  
      this.#highlightTimeOutFuncId = setTimeout(() => {
        home.highlightedText = selection.toString();

        const translatorViewerNodes = home.tree.findByData('viewerId', 'translator-viewer');
        const imagesViewerNodes = home.tree.findByData('viewerId', 'images-viewer');

        translatorViewerNodes?.[0]?.data?.viewer.updateTextDisplay(selection.toString());
        imagesViewerNodes?.[0]?.data?.viewer.updateTextDisplay(selection.toString());
      }, 500);
      
    } else {
      console.log('No text selected or selection cleared.');
    }
  }
}
