import { getWordDefinition } from 'apis/dictionary';

class TranslatorViewer {
  constructor() {
    this.init();    
  }
  
  init() {
    this.textDisplay = document.getElementById('translator-text-display')
    this.dictionaryLookupButton = document.getElementById('dictionary-lookup-button')

    this.dictionaryLookupButton.addEventListener('click', this.#lookupWordEvent.bind(this))
  }
  
  updateTextDisplay(text) {
    translatorViewer.textDisplay.textContent = text;          
  }

  async #lookupWordEvent() {
    console.log(await getWordDefinition(this.textDisplay.textContent));
  }
}

export const translatorViewer = new TranslatorViewer(); 
