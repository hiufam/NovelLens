import { getImages } from '../apis/images';
import { Viewer } from '../views/viewer';

export class ImagesViewer extends Viewer {
  imageContainers = [];

  constructor(container, node) {
    super(container, node);    
    this.init(container);
  }
  
  init() {   
    this.viewContainer = this.container.querySelector('.images-viewer'); 
    this.viewBodyContainer = this.container.querySelector('.images-viewer-body');     
    this.textDisplay = this.container.querySelector('.images-text-display')
    this.lookupButton = this.container.querySelector('.images-lookup-button')
    this.imageSizeSlider = this.container.querySelector('#image-size-range')    

    this.lookupButton.addEventListener('click', this.#searchImageEvent.bind(this))
    this.imageSizeSlider.addEventListener('input', this.#changeImageSizeEvent.bind(this))
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
    if (this.imageContainers.length > 0) {
      this.imageContainers.forEach((imgContainer) => {
        imgContainer.remove();
      });

      this.imageContainers = [];
    }

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
    this.textDisplay.textContent = text;          
  }

  async #searchImageEvent() {
    const response = await getImages({query: this.textDisplay.textContent});
    const images = response?.data?.photos || [];

    this.displayImages(images);
  }

  #changeImageSizeEvent(e) {
    const heightPercentage = `${e.target.value}%`;
    const imageContainers = this.container.querySelectorAll('.image-container');

    Array.from(imageContainers).forEach((imageContainers) => {
      imageContainers.style.height = heightPercentage;
    });    
  }    
}
