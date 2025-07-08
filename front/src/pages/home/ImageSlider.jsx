import React, { useEffect, useRef, useState } from "react";

const initialImages = [
  { id: 1, src: "https://picsum.photos/1000/400?random=1", alt: "Shop 1" },
  { id: 2, src: "https://picsum.photos/1000/400?random=2", alt: "Shop 2" },
  { id: 3, src: "https://picsum.photos/1000/400?random=3", alt: "Shop 3" },
  { id: 4, src: "https://picsum.photos/1000/400?random=4", alt: "Shop 4" },
];

const ImageSlider = () => {
  const [images, setImages] = useState(initialImages);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const thumbnailRef = useRef(null); // reference to one thumbnail

  useEffect(() => {
    const interval = setInterval(() => {
      slideNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  const slideNext = () => {
    if (isAnimating) return;
    if (!thumbnailRef.current) return;

    const thumbnailWidth = thumbnailRef.current.offsetWidth + 8; // width + gap (8px gap)
    setIsAnimating(true);
    setSliderPosition(-thumbnailWidth);

    setTimeout(() => {
      const updated = [...images];
      const first = updated.shift();
      updated.push(first);
      setImages(updated);

      setSliderPosition(0);
      setIsAnimating(false);
    }, 300);
  };

  const handleThumbnailClick = (index) => {
    if (index === 0 || isAnimating) return;
    setImages((prev) => {
      const newArr = [...prev.slice(index), ...prev.slice(0, index)];
      return newArr;
    });
  };

  const mainImage = images[0];

  return (
    <div className="w-full px-4 py-10 bg-blue-50 rounded-xl shadow-inner space-y-8">
      {/* Main Image */}
      <div
        className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] bg-cover bg-center rounded-xl shadow-lg transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${mainImage.src})`,
        }}
      >
        <div className="w-full h-full bg-black/30 flex items-center justify-center rounded-xl">
          <h2 className="text-xl md:text-2xl lg:text-3xl text-white font-bold drop-shadow-lg">
            {mainImage.alt}
          </h2>
        </div>

        {/* Thumbnails */}
        <div className="absolute bottom-4 right-4 overflow-hidden w-[280px] sm:w-[350px] md:w-[400px] lg:w-[430px]">
          <div
            className="flex gap-2 md:gap-3 flex-row-reverse"
            style={{
              transform: `translateX(${sliderPosition}px)`,
              transition: isAnimating ? "transform 300ms ease-in-out" : "none",
            }}
          >
            {[...images, images[0]].map((img, index) => (
              <div
                ref={index === 0 ? thumbnailRef : null} // attach ref only to the first thumbnail
                key={index === images.length ? `clone-${img.id}` : img.id}
                onClick={() =>
                  index !== images.length && handleThumbnailClick(index)
                }
                className={`w-20 h-12 sm:w-24 sm:h-14 rounded-md overflow-hidden shadow-md cursor-pointer transform transition-transform duration-300 ${
                  index === 0
                    ? "ring-2 ring-white scale-105"
                    : "hover:scale-105"
                }`}
                style={{
                  backgroundImage: `url(${img.src})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  flexShrink: 0,
                }}
              >
                <div className="w-full h-full bg-black/30 flex items-center justify-center rounded-md">
                  <h3 className="text-[10px] sm:text-xs text-white font-medium text-center px-1">
                    {img.alt}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;
