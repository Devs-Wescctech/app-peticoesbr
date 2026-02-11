import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.originalname.replace(ext, '').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    cb(null, name + '-' + uniqueSuffix + ext);
  }
});

export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const imageTypes = /jpeg|jpg|png|gif|webp/;
    const videoTypes = /mp4|webm|mov|avi|mkv/;
    const ext = path.extname(file.originalname).toLowerCase();
    const isImage = imageTypes.test(ext) && imageTypes.test(file.mimetype);
    const isVideo = videoTypes.test(ext) || file.mimetype.startsWith('video/');
    
    if (isImage || isVideo) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens e vídeos são permitidos'));
    }
  }
});
