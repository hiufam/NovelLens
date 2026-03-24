import { getWordDefinition } from '../apis/dictionary';
import { Viewer } from '../views/viewer';

export class TranslatorViewer extends Viewer {
  constructor(container, node) {
    super(container, node);    
    this.init(container);
  }
  
  init() { 
    this.viewContainer = this.container.querySelector('.translator-viewer'); 
    this.viewBodyContainer = this.container.querySelector('.translator-viewer-body');     
    this.textInput = this.container.querySelector('.translator-text-input')
    this.lookupButton = this.container.querySelector('.translator-lookup-button')
    
    this.lookupButton.addEventListener('click', this.#lookupWordEvent.bind(this))
  }
  
  updateTextDisplay(text) {
    this.textInput.value = text;          
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

    if (data.phonetic) {
      const textPhonetic = document.createElement('i');
      textPhonetic.textContent = data.phonetic;
    }

    defSearchContainer.append(textPhonetic);

    data.meanings.forEach((meaning) => {
      const textMeaningContainer = document.createElement('div');
      const textPartOfSpeech = this.#createParthOfSpeechTag(meaning.partOfSpeech);
      
      textMeaningContainer.append(textPartOfSpeech);
      
      const textDefsContainer = document.createElement('ol');
      
      textMeaningContainer.append(textDefsContainer);

      meaning.definitions.forEach((def) => {
        const textDefContainer = document.createElement('li');

        const textDef = document.createElement('span');
        textDef.textContent = def.definition;

        textDefContainer.append(textDef);
        textDefsContainer.append(textDefContainer);
      });

      defSearchContainer.append(textMeaningContainer);
    });

    this.viewBodyContainer.append(defSearchContainer);
  }

  async #lookupWordEvent() {
    const response = await getWordDefinition(this.textInput.value);
    const data = response.data;

    if (data?.length > 0) {
      this.displayTextDefinition(data[0]);
    }
  }

  /**
   * <span class="badge bg-primary">Example</span>
   * @param {*} partOfSpeech 
   */
  #createParthOfSpeechTag(partOfSpeech) {
    const tag = document.createElement('span');
    tag.classList.add('badge');
    tag.textContent = partOfSpeech;

    switch (partOfSpeech) {
      case 'noun':
        tag.classList.add('bg-success');
        break;
      case 'verb':
        tag.classList.add('bg-danger');
        break;
      case 'adjective':
        tag.classList.add('bg-warning');
        break;
      case 'adverb':
        tag.classList.add('bg-info');
        break;
      case 'preposition':
        tag.classList.add('bg-orange');
        break;
      case 'conjunction':
        tag.classList.add('bg-purple');
        break;
      case 'injection':
        tag.classList.add('bg-teal');
        break;
      case 'pronoun':
        tag.classList.add('bg-pink');
        break;
      default:
        tag.classList.add('bg-primary');
      }
      return tag;
  }
}
