import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchImages, ImageData } from '../services/imagesService';
import { getMissionSol } from '../utils/marsDate';

interface SlideProps {
  data: ImageData | null;
  width: number;
  toggleFullscreen?: Function;
}

interface SliderState {
  index: number;
  slides: (ImageData | null)[];
  translateX: number;
  transition: boolean;
}

interface SliderStoreState {
  images: ImageData[];
  sol: number;
}

function Slide({ data, width, toggleFullscreen }: SlideProps) {
  return (
    <div className="slider__slide" style={{ width }}>
      <div className="slider__slide-content">
        <div className="picture-wrapper">
          {data && (
            <img className="picture" src={data.src} onClick={() => toggleFullscreen && toggleFullscreen()}></img>
          )}
        </div>
        {data && (
          <a href={data.link} className="caption" target="_blank" rel="noreferrer noopener">
            {data.caption}
          </a>
        )}
      </div>
    </div>
  );
}

const IMAGES_BY_REQ = 5;

function Slider() {
  const emptySlide = null;

  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [width, setWidth] = useState<number>(window.innerWidth);

  const [storeState, setStoreState] = useState<SliderStoreState>({
    images: [],
    sol: -1
  });

  const [state, setState] = useState<SliderState>({
    index: 0,
    slides: [emptySlide, emptySlide, emptySlide],
    translateX: width,
    transition: false
  });

  const sliderRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const isLastSlide = useMemo(() => state.index === storeState.images.length - 1, [state.index, storeState.images]);
  const isFirstSlide = useMemo(() => state.index === 0, [state.index]);

  useEffect(() => {
    async function fetchInitialData() {
      const curSol = getMissionSol(new Date()) - 1;
      const images = await fetchImages(curSol, IMAGES_BY_REQ);

      setStoreState({
        images,
        sol: curSol - IMAGES_BY_REQ
      });

      setState({
        ...state,
        slides: [images[1], images[0], emptySlide]
      });
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const startSol = storeState.sol;
      const images = await fetchImages(startSol, IMAGES_BY_REQ);

      setStoreState({
        sol: startSol - IMAGES_BY_REQ,
        images: [...storeState.images, ...images]
      });
    }

    if (state.transition === false && storeState.sol > 0 && storeState.images.length - state.index === 3) {
      fetchData();
    }
  }, [state.transition]);

  useEffect(() => {
    const slider = sliderRef.current;

    const onResize = () => {
      const newWidth = window.innerWidth;
      setWidth(newWidth);
      setState({
        ...state,
        translateX: newWidth
      });
    };

    const onTransitionEnd = async () => {
      const _slides = [
        storeState.images[state.index + 1] || emptySlide,
        storeState.images[state.index],
        storeState.images[state.index - 1] || emptySlide
      ];

      setState({
        ...state,
        slides: _slides,
        transition: false,
        translateX: width
      });
    };

    slider?.addEventListener('transitionend', onTransitionEnd);
    window.addEventListener('resize', onResize);
    return () => {
      slider?.removeEventListener('transitionend', onTransitionEnd);
      window.removeEventListener('resize', onResize);
    };
  }, [state, width, storeState]);

  const goNextSlide = () => {
    if (isLastSlide || state.transition) {
      return;
    }

    setState({
      ...state,
      index: ++state.index,
      transition: true,
      translateX: 0
    });
  };

  const goPrevSlide = () => {
    if (isFirstSlide || state.transition) {
      return;
    }

    setState({
      ...state,
      index: --state.index,
      transition: true,
      translateX: 2 * width
    });
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  return (
    <div className={`slider ${fullscreen ? 'fullscreen' : ''}`}>
      <div className="slider__container">
        {!isLastSlide && <div className="slider__arrow slider__arrow--left" onClick={goNextSlide}></div>}
        <div className="slider__slides">
          <div
            ref={sliderRef}
            className="slider__wrapper"
            style={{
              width: width * state.slides.length,
              transform: `translateX(-${state.translateX}px)`,
              transitionDuration: `${state.transition ? '500ms' : '0ms'}`
            }}
          >
            <Slide data={state.slides[2]} width={width}></Slide>
            <Slide data={state.slides[1]} width={width} toggleFullscreen={toggleFullscreen}></Slide>
            <Slide data={state.slides[0]} width={width}></Slide>
          </div>
        </div>
        {!isFirstSlide && <div className="slider__arrow slider__arrow--right" onClick={goPrevSlide}></div>}
      </div>
      {fullscreen && (
        <button className="slider__close_fullscreen" onClick={() => setFullscreen(false)}>
          <svg viewBox="0 0 24 24">
            <g>
              <path d="M13.414 12l5.793-5.793c.39-.39.39-1.023 0-1.414s-1.023-.39-1.414 0L12 10.586 6.207 4.793c-.39-.39-1.023-.39-1.414 0s-.39 1.023 0 1.414L10.586 12l-5.793 5.793c-.39.39-.39 1.023 0 1.414.195.195.45.293.707.293s.512-.098.707-.293L12 13.414l5.793 5.793c.195.195.45.293.707.293s.512-.098.707-.293c.39-.39.39-1.023 0-1.414L13.414 12z"></path>
            </g>
          </svg>
        </button>
      )}
    </div>
  );
}

export default Slider;
