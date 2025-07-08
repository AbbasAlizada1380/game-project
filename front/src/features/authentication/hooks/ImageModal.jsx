// components/ImageModal.jsx
const ImageModal = ({ imageSrc, onClose }) => {
  if (!imageSrc) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
      onClick={onClose} // clicking outside closes the modal
    >
      <div
        className="bg-white rounded-xl p-4 max-w-3xl w-full relative shadow-xl"
        onClick={(e) => e.stopPropagation()} // 👈 prevent propagation to outer div
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm"
        >
          ×
        </button>
        <img
          src={imageSrc}
          alt="Athlete"
          className="w-full h-auto max-h-[80vh] object-contain rounded"
        />
      </div>
    </div>
  );
};

export default ImageModal;
