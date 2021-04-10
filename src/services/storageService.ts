import { ImageData } from "./imagesService";

interface Store {
  version: number;
  images: Record<string, ImageData>
}

class ImageStorage {
  static storeKey: string = 'imagedata';
  static version: number = 1;
  static store: Store;

  static init() {
    const lsStore = localStorage.getItem(this.storeKey);
    if (lsStore !== null) {
      this.store = JSON.parse(lsStore) as Store;
    } else {
      this.store = { version: this.version, images: {} };
    }
  }

  static sync() {
    localStorage.setItem(this.storeKey, JSON.stringify(this.store));
  }

  static set(sol: number, imageData: ImageData) {
    this.store.images[sol.toString()] = imageData;
    this.sync();
  }

  static get(sol: number): ImageData | null {
    return this.store.images[sol.toString()] || null;
  }
}

ImageStorage.init();

export default ImageStorage;
