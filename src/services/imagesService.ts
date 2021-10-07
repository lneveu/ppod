import ImageStorage from "./storageService";

const API_URL = 'https://mars.nasa.gov/rss/api/?feed=raw_images&category=mars2020&feedtype=json&num=100&page=0&order=sol+desc&condition_2={sol}:sol:gte&condition_3={sol}:sol:lte&extended=sample_type::full,product_type::raw'

interface NasaRawData {
  imageid: string;
  image_files: { large: string };
  sol: number;
  date_taken_utc: string;
  title: string;
}

export interface SolPayload {
  sol: number;
  imageData?: ImageData
}

export interface ImageData {
  id: string;
  src: string;
  link: string;
  sol: number;
  date: Date;
  caption: string;
}

function preloadImage(src: string) {
  const img = new Image();
  img.src = src;
}

function formatImageData(rawData: NasaRawData): ImageData {
  return {
    id: rawData.imageid,
    src: rawData.image_files.large,
    link: `https://mars.nasa.gov/mars2020/multimedia/raw-images/${rawData.imageid}`,
    sol: rawData.sol,
    date: new Date(rawData.date_taken_utc),
    caption: rawData.title
  };
}

async function fetchImageForSol(sol: number): Promise<ImageData | null> {
  const dataFromLS = ImageStorage.get(sol);
  if (dataFromLS !== null) {
    return Promise.resolve(dataFromLS);
  }

  const url = API_URL.replaceAll('{sol}', sol.toString());
  const res = await fetch(url);
  const json = await res.json();

  if (json.images && json.images.length > 0) {
    const image = json.images[Math.floor(json.images.length / 2)]; // pick a random image
    const imageData = formatImageData(image);
    ImageStorage.set(sol, imageData);
    return imageData;
  } else {
    return null;
  }
}

async function fetchImages(sol: number, count: number = 5): Promise<SolPayload[]> {
  const sols = Array(count).fill(null).map((_, i) => sol - i).filter(i => i >= 0);
  const rawImages = await Promise.all(
    sols.map(s => fetchImageForSol(s))
  );

  const solPayload = rawImages.map((img, i) => {
    const payload: SolPayload = { sol: sols[i] }
    if (img) {
      preloadImage(img.src);
      payload.imageData = img
    }
    return payload
  })

  return solPayload
}

export { fetchImages };
