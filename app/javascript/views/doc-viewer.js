import { convertDocToHtml, convertDocToPdf } from '../apis/conversion';
import { home } from '../views/home';
import { Viewer } from '../views/viewer';

import * as zip from '@zip.js/zip.js';
import * as pdfjsLib from 'pdfjs-dist';
import * as pdfWorker  from 'pdfjs-dist/build/pdf.worker.mjs';

function fileToBase64URL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

// https://stackoverflow.com/questions/65740268/create-react-app-how-to-copy-pdf-worker-js-file-from-pdfjs-dist-build-to-your
const worker = new URL(
  pdfWorker.WorkerMessageHandler,
  import.meta.url
).toString();

// Access public folder
const wasmUrl = new URL(
  'pdfjs-dist/wasm/',
  window.location.origin
).toString();

pdfjsLib.GlobalWorkerOptions.workerSrc = worker

export class DocViewer extends Viewer {
  #highlightTimeOutFuncId = undefined;
  #file;
  #images;

  #pdfDoc;
  #scale = 1;
  #autoScale = true;
  #pageNum = 1;
  #totalPages = 0;
  
  constructor(container, node) {
    super(container, node);    
    this.init(container);
  }

  init() {
    this.#highlightTimeOutFuncId = undefined
    this.docPicker = this.container.querySelector('.doc-picker');
    this.docViewerBody = this.container.querySelector('.doc-viewer-body');
    this.docTools = this.container.querySelector('.doc-viewer-tools');
    this.pageInfo = this.container.querySelector('.page-info');
    this.pageInfoInput = this.pageInfo.querySelector('.page-info-input');
    this.totalPages = this.pageInfo.querySelector('.total-pages');

    this.convertButton = this.container.querySelector('.convert-button');
    this.viewButton = this.container.querySelector('.view-button');
    this.widthFitButton = this.container.querySelector('.fit-width');
    this.heightFitHeight = this.container.querySelector('.fit-height');
    this.prevButton = this.container.querySelector('.prev');
    this.nextButton = this.container.querySelector('.next');
    this.zoomInButton = this.container.querySelector('.zoom-in');
    this.zoomOutButton = this.container.querySelector('.zoom-out');
    
    this.docPicker.onchange = (e) => this.#handleDocPickerChange(e);
    this.viewButton.addEventListener('click', () => this.#viewFile.bind(this)(this.#file));
    
    this.canvas = this.container.querySelector('.pdf-canvas');
    this.textLayerContainer = this.container.querySelector('.textLayer');
    
    this.prevButton.onclick = () => {
      if (this.#pageNum <= 1) return;
      this.#pageNum--;
      this.#renderPage(this.#pageNum);
    };

    this.nextButton.onclick = () => {
      if (this.#pageNum >= this.#pdfDoc.numPages) return;
      this.#pageNum++;
      this.#renderPage(this.#pageNum);
    };

    this.zoomInButton.onclick = () => {
      if (this.#autoScale) {
        this.#scale = Math.ceil(this.#scale / 0.2) * 0.2
      }

      this.#scale += 0.2;
      this.#autoScale = false;
      this.#renderPage(this.#pageNum);
    };

    this.zoomOutButton.onclick = () => {
      if (this.#autoScale) {
        this.#scale = Math.ceil(this.#scale / 0.2) * 0.2
      }

      this.#scale -= 0.2;
      this.#autoScale = false;
      this.#renderPage(this.#pageNum);
    };

    this.widthFitButton.onclick = () => {
      this.#autoScale = true;
      this.#scale = 1;
      this.#renderPage(this.#pageNum);
    }

    this.heightFitHeight.onclick = () => {
      this.#autoScale = true;
      this.#scale = 1;
      this.#renderPage(this.#pageNum, 'height');
    }

    this.pageInfoInput.addEventListener('change', (event) => {
      const value = event.target.value;
      const pageNum = parseInt(value);

      if (pageNum >= 1 && pageNum <= this.#totalPages) {
        this.#pageNum = pageNum;
        this.#renderPage(pageNum);
      }
    });
  }

  /**
   * https://mozilla.github.io/pdf.js/examples/
   */
  async #viewFile(file) {
    if (!file) return;    
    let pdfFile = file;
    const ext = file.name.split('.').pop();
    
    if (ext === 'docx') {
      pdfFile = await this.#convertDocxToPDF(file);
    }

    const fileUrl = await fileToBase64URL(pdfFile);    
    const loadingTask = pdfjsLib.getDocument({
      url: fileUrl,
      wasmUrl,
    })

    loadingTask.promise.then(async (pdf) => {
      this.#pdfDoc = pdf;
      this.#totalPages = pdf.numPages;
      this.totalPages.textContent = pdf.numPages;
      this.#pageNum = 1;

      this.pageInfo.hidden = false;
      this.docTools.hidden = false;
      this.pageInfoInput.value = 1;

      this.#renderPage(this.#pageNum);
    });
  }

  async #convertDocxToPDF(file) {
    const formData = new FormData();
    formData.append('file', file);

    const data = await convertDocToPdf(formData);
    const base64pdf = data.pdf;

    var binary = atob(base64pdf)
    var array = new Uint8Array(binary.length)
    for( var i = 0; i < binary.length; i++ ) { array[i] = binary.charCodeAt(i) }
    const blob = new Blob([array], {
      type: 'application/pdf'
    })

    return blob
  }

  async #convertDocxToHTML(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const data = await convertDocToHtml(formData);

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(data.html, 'text/html');    
    const based64media = data.media;

    
    if (based64media) {
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
            const imageId = entry.filename.split('/')[1].split('.')[0] // Ex: 'media/image1.jpeg'
            
            return entry.getData(new zip.BlobWriter() , {
              onend: () => {              
                this.#images.push({
                  id: imageId,
                  entryIndex: index,
                  name: entry.filename,
                });        
              }
            });
          }));
  
          this.#images.forEach((image) => {
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
    }



    
    this.docViewerBody.innerHTML = htmlDoc.getElementsByTagName('body')[0].innerHTML;  
    
    // Update doc images with new sources
    this.#images.forEach((image) => {      
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

  async #handleDocPickerChange(e) {    
    const files = e.target.files;  
    this.#file = files[0];
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

  /**
   * 
   * @param {pdfjsLib.PDFPageProxy} page 
   */
  async #renderPage(number, size) {    
    const page = await this.#pdfDoc.getPage(number);

    let scale = this.#scale;
    
    if (this.#autoScale) {
      scale = this.#getAutoScale(page, size);
      this.#scale = scale;
    }    

    if (this.#pdfDoc.numPages) {
      this.pageInfoInput.value = number;
    }
    
    const viewport = page.getViewport({ scale: scale });

    // Canvas render
    this.canvas.height = viewport.height;
    this.canvas.width = viewport.width;

    page.render({
      canvasContext: this.canvas.getContext('2d'),
      viewport: viewport,
    });


    // https://github.com/mozilla/pdf.js/issues/18206
    const textContent = await page.getTextContent();

    this.textLayerContainer.innerHTML = '';
    this.textLayerContainer.style.setProperty('--scale-factor', scale.toString());
    this.textLayerContainer.style.setProperty('--text-scale-factor', scale.toString()); // Stupid ass variable (Must manually set)

    const textLayer = new pdfjsLib.TextLayer({
      textContentSource: textContent,
      container: this.textLayerContainer,
      viewport: viewport,      
    });

    this.textLayerContainer.style.height = `${this.canvas.height}px`;
    this.textLayerContainer.style.width = `${this.canvas.width}px`;

    await textLayer.render();

    // document.getElementById('page-info').textContent = `Page ${number} / ${this.#pdfDoc.numPages}`;
  }

  #getAutoScale(page, size) {
    let containerSize
    if (size === 'height') {
      containerSize = this.docViewerBody.clientHeight;
    } else {
      containerSize = this.docViewerBody.clientWidth;
    }
    const viewport = page.getViewport({ scale: 1 });
    
    let scale;
    if (size === 'height') {
      scale = containerSize / viewport.height;
    } else {
      scale =  containerSize / viewport.width;
    }

    return scale;
  }
}
