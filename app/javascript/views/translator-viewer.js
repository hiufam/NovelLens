import { getWordDefinition } from 'apis/dictionary';

export class TranslatorViewer {
  constructor(container) {
    this.container = container;   
    this.init();    
  }
  
  init() { 
    this.viewContainer = this.container.querySelector('.translator-viewer'); 
    this.viewBodyContainer = this.container.querySelector('.translator-viewer-body');     
    this.textDisplay = this.container.querySelector('.translator-text-display')
    this.lookupButton = this.container.querySelector('.translator-lookup-button')

    this.lookupButton.addEventListener('click', this.#lookupWordEvent.bind(this))
  }
  
  updateTextDisplay(text) {
    this.textDisplay.textContent = text;          
  }
  
  /**
   * 
   * @param {{
   *  meanings: {
   *    partOfSpeech: string,
   *    definitions: {
   *      antonyms: string[],
   *      definition: string,
   *      synonyms: string[],
   *      example: string,
   *    }[],
   *    synonyms: string[],
   *  }[], 
   *  phonetic: string, 
   *  sourceUrls: string[],
   * }} data 
   */
  displayTextDefinition(data) {
    const existingDefSearchContainer = this.viewBodyContainer.querySelector('.def-search-container');
    
    // Remov previous earch if exist
    if (existingDefSearchContainer) {
      existingDefSearchContainer.remove();
    }

    const defSearchContainer = document.createElement('div');
    defSearchContainer.classList = 'def-search-container';

    const textPhonetic = document.createElement('span');
    textPhonetic.textContent = data.phonetic;

    defSearchContainer.append(textPhonetic);

    data.meanings.forEach((meaning) => {
      const textMeaningContainer = document.createElement('div');
      
      const textPartOfSpeech = document.createElement('span');
      textPartOfSpeech.textContent = meaning.partOfSpeech;

      textMeaningContainer.append(textPartOfSpeech);
      
      const textDefsContainer = document.createElement('div');
      
      textMeaningContainer.append(textDefsContainer);

      meaning.definitions.forEach((def) => {
        const textDefContainer = document.createElement('div');
        
        const textDef = document.createElement('span');
        textDef.textContent = def.definition;

        textDefContainer.append(textDef);
        textMeaningContainer.append(textDefContainer);
      });

      defSearchContainer.append(textMeaningContainer);
    });

    this.viewBodyContainer.append(defSearchContainer);
  }

  async #lookupWordEvent() {
    const response = await getWordDefinition(this.textDisplay.textContent);
    const data = response.data;

    if (data?.length > 0) {
      this.displayTextDefinition(data[0]);
    }
  }
}
