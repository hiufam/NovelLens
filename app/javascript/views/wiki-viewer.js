import { searchWiki } from "apis/browse"

export class WikiViewer {
  searchContainers = [];

  constructor(container) {
    this.container = container;   
    this.init();    
  }
  
  init() {   
    this.viewContainer = this.container.querySelector('.wiki-viewer'); 
    this.viewBodyContainer = this.container.querySelector('.wiki-viewer-body');     
    this.lookupButton = this.container.querySelector('.wiki-lookup-button')
    this.input = this.container.querySelector('.wiki-input')

    this.lookupButton.addEventListener('click', this.#searchWikiEvent.bind(this))
  }

  /**
   * @param {{
   *   batchcomplete: string,
   *   continue: {
   *     sroffset: number,
   *     continue: string
   *   },
   *   query: {
   *     searchinfo: {
   *       totalhits: number,
   *       suggestion?: string,
   *       suggestionsnippet?: string
   *     },
   *     search: {
   *       ns: number,
   *       title: string,
   *       pageid: number,
   *       size: number,
   *       wordcount: number,
   *       snippet: string,
   *       timestamp: string
   *     }[]
   *   }
   * }} data
   */
  #displaySearches(data) {
    // If previous searches exist, remove them
    this.searchContainers.forEach((searchContainer) => {
      searchContainer.remove();
    });

    const searches = data?.query?.search || [];
    searches.forEach((search) => {
      const searchContainer = document.createElement('div');
      const searchSnippet = document.createElement('span');
      
      searchSnippet.innerHTML = search.snippet

      searchContainer.append(searchSnippet);

      this.viewBodyContainer.append(searchContainer);

      this.searchContainers.push(searchContainer);
    });
  }

  async #searchWikiEvent() {
    const value = this.input.value;
    const response = await searchWiki(value);
    
    this.#displaySearches(response.data);
  }
}
