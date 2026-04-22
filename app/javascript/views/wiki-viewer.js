import { searchWiki } from "../apis/browse"
import { Viewer } from '../views/viewer';
import { home } from '../views/home';

export class WikiViewer extends Viewer {
  searchContainers = [];

  constructor(container, node) {
    super(container, node);    
    this.init(container);
  }
  
  init() {   
    this.viewContainer = this.container.querySelector('.wiki-viewer'); 
    this.viewBodyContainer = this.container.querySelector('.wiki-viewer-body');     
    this.lookupButton = this.container.querySelector('.wiki-lookup-button')
    this.input = this.container.querySelector('.wiki-input')

    this.lookupButton.addEventListener('click', this.#searchWikiEvent.bind(this))
  }

  loadSavedData(data) {
    this.input.value = data;
    // this.#searchWikiEvent();
  }

  /**
   * @param {{
   *   batchcomplete: string,
   *   continue: {
   *     sroffset: number,
   *     continue: string
   *   },
   *   url: string,
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
      searchContainer.classList.add('search-container');

      const searchBadge = document.createElement('span');
      searchBadge.classList.add('badge', 'bg-secondary', 'search-badge');

      const searchLink = document.createElement('a');      
      searchLink.classList.add('search-link');
      searchLink.addEventListener('click', () => {
        const url = (new URL(search.title, data.url)).href;
        window.open(url, '_blank');
      })

      searchBadge.append(searchLink);

      const searchTitle = document.createElement('span');
      searchTitle.textContent = search.title;

      searchLink.append(searchTitle);

      const linkIcon = document.createElement('i');
      linkIcon.classList.add('bi', 'bi-box-arrow-up-right');

      searchLink.append(linkIcon);

      searchContainer.append(searchBadge);

      const searchSnippet = document.createElement('span');
      
      searchSnippet.innerHTML = search.snippet

      searchContainer.append(searchSnippet);

      this.viewBodyContainer.append(searchContainer);

      this.searchContainers.push(searchContainer);
    });
  }

  async #searchWikiEvent() {
    this.setLoading(true);
    try {
      const value = this.input.value;
      const response = await searchWiki(value);
      
      this.#displaySearches(response.data);
  
      home.containerView.saveData(this.node.key, value);
      this.setLoading(false);
    } catch (error) {
      this.setLoading(false);
    }
  }
}
