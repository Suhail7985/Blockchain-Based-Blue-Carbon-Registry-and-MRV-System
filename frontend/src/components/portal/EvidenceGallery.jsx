import React, { useState } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const EvidenceGallery = ({ isOpen, onClose, images, title }) => {
  const [index, setIndex] = useState(0);

  if (!isOpen || !images || images.length === 0) return null;

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-w-5xl h-full flex flex-col justify-center gap-4" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all">
          <FaTimes className="w-6 h-6" />
        </button>

        <div className="relative flex-1 flex items-center justify-center overflow-hidden">
          <img 
            src={images[index]} 
            alt="Evidence" 
            className="max-h-full max-w-full object-contain rounded-xl shadow-2xl border-4 border-white/5 animate-in fade-in duration-300" 
          />
          
          {images.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-4 p-4 bg-black/40 text-white rounded-full hover:bg-black/60 transition-all border border-white/10">
                <FaChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={next} className="absolute right-4 p-4 bg-black/40 text-white rounded-full hover:bg-black/60 transition-all border border-white/10">
                <FaChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        <div className="flex justify-center gap-2 overflow-x-auto py-4">
          {images.map((img, i) => (
            <button 
              key={i} 
              onClick={() => setIndex(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === i ? 'border-bc-green-500 scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
            >
              <img src={img} alt="Thumb" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        <div className="text-center text-white/80 font-medium pb-4">
          <p className="text-lg">{title}</p>
          <p className="text-xs mt-1 text-white/40">Evidence {index + 1} of {images.length}</p>
        </div>
      </div>
    </div>
  );
};

export default EvidenceGallery;
