import { getImages } from '../apis/images';
import { Viewer } from '../views/viewer';
import { home } from '../views/home';

export class ImagesViewer extends Viewer {
  imageContainers = [];

  constructor(container, node) {
    super(container, node);    
    this.init(container);
  }
  
  init() {   
    this.viewContainer = this.container.querySelector('.images-viewer'); 
    this.viewBodyContainer = this.container.querySelector('.images-viewer-body');     
    this.textInput = this.container.querySelector('.images-text-input')
    this.lookupButton = this.container.querySelector('.images-lookup-button')
    this.imageSizeSlider = this.container.querySelector('#image-size-range')    

    this.lookupButton.addEventListener('click', this.#searchImageEvent.bind(this))
    this.imageSizeSlider.addEventListener('input', this.#changeImageSizeEvent.bind(this))
  }

  loadSavedData(data) {
    this.textInput.value = data;
    this.#searchImageEvent();
  }

  /**
   * 
   * @param {{
   *  id: number,
   *  width: number,
   *  height: number,
   *  url: string,
   *  photographer: string,
   *  photographer_url: string,
   *  photographer_id: number,
   *  avg_color: string,
   *  src: {
   *    original: string,
   *    large2x: string,
   *    large: string,
   *    medium: string,
   *    small: string,
   *    portrait: string,
   *    landscape: string,
   *    tiny: string
   *  },
   *  liked: boolean,
   *  alt: string
   * }[]} images
  */
  displayImages(images) {
    // Remove existing image containers
    if (this.providerTag) {
      this.providerTag.remove();
    }

    if (this.imageContainers.length > 0) {
      this.imageContainers.forEach((imgContainer) => {
        imgContainer.remove();
      });
      
      this.imageContainers = [];
    }

    this.providerTag = document.createElement('i');
    this.providerTag.textContent = '* images provided by Pexel';

    this.viewContainer.append(this.providerTag);    
    this.viewContainer.insertBefore(this.providerTag, this.viewBodyContainer);

    images.forEach((image) => {
      const imageContainer = document.createElement('div');
      
      imageContainer.classList = ['image-container'];
      
      const imageDisplay = document.createElement('img');
      
      imageDisplay.src = image.src.original;
      imageDisplay.classList = ['image-display'];
      
      imageContainer.append(imageDisplay);

      this.imageContainers.push(imageContainer);
      this.viewBodyContainer.append(imageContainer);
    });
  }

  updateTextDisplay(text) {
    this.textInput.value = text;          
  }

  async #searchImageEvent() {
    const value = this.textInput.value;
    const response = await getImages({query: this.textInput.value});
    const images = response?.data?.photos || [];

    this.displayImages(images);

    home.containerView.saveData(this.node.key, value);
  }

  #changeImageSizeEvent(e) {
    const heightPercentage = `${e.target.value}%`;
    const imageContainers = this.container.querySelectorAll('.image-container');

    Array.from(imageContainers).forEach((imageContainers) => {
      imageContainers.style.height = heightPercentage;
    });    
  }    
}
