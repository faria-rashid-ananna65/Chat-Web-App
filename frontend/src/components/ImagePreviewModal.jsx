import { motion } from 'framer-motion'
import { FiX, FiDownload } from 'react-icons/fi'

const ImagePreviewModal = ({ image, onClose }) => {
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = image
    link.download = `image-${Date.now()}.jpg`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <FiX size={24} />
      </button>

      {/* Download button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleDownload()
        }}
        className="absolute top-4 right-16 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <FiDownload size={24} />
      </button>

      {/* Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image}
          alt="Preview"
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
        />
      </motion.div>
    </div>
  )
}

export default ImagePreviewModal
