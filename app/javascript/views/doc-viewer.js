import { convertDocToHtml } from 'apis/conversion';
import { home } from 'views/home';
import { translatorViewer } from 'views/translator-viewer';

class DocViewer {
  #highlightTimeOutFuncId = undefined;
  
  constructor() {
    this.init();
  }
  
  init() {
    this.#highlightTimeOutFuncId = undefined
    this.docPicker = document.getElementById('doc-picker');
    this.docViewerBody = document.getElementById('doc-viewer-body');
    
    this.docPicker.onchange = (e) => this.#handleDocPickerChange(e)
  }

  async #handleDocPickerChange(e) {    
    const files = e.target.files;  
  
    const formData = new FormData();
    formData.append("file", files[0]);
    
    const data = await convertDocToHtml(formData);

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(data.html, 'text/html');    

    this.docViewerBody.innerHTML = htmlDoc.getElementsByTagName('body')[0].innerHTML;  
    
    // Add highlight event only when mouse is over document
    document.addEventListener('selectionchange', this.#hightlightTextEvent.bind(this));
      this.docViewerBody.addEventListener('mouseenter', () => {
      document.addEventListener('selectionchange', this.#hightlightTextEvent.bind(this));
    });

    this.docViewerBody.addEventListener('mouseleave', () => {
      document.removeEventListener('selectionchange', this.#hightlightTextEvent.bind(this));
    });
  }

  #hightlightTextEvent() {
    const selection = window.getSelection();
    
    if (selection && selection.rangeCount > 0 && selection.toString().length > 0) {
      if (this.#highlightTimeOutFuncId) clearTimeout(this.#highlightTimeOutFuncId);
  
      this.#highlightTimeOutFuncId = setTimeout(() => {
        home.highlightedText = selection.toString();
        
        translatorViewer.updateTextDisplay(selection.toString());          
      }, 500);
      
    } else {
      console.log('No text selected or selection cleared.');
    }
  }
}

export const docViewer = new DocViewer();
