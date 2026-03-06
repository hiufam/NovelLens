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

        const translatorViewerNodes = home.tree.findByData('viewId', 'translator-viewer');

        translatorViewerNodes?.[0]?.data?.viewer.updateTextDisplay(selection.toString());
      }, 500);
      
    } else {
      console.log('No text selected or selection cleared.');
    }
  }
}
