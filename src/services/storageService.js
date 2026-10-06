import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export const storageService = {
  // Upload any file to Firebase Storage and return its public URL
  uploadFile: async (file, pathPrefix = 'uploads') => {
    if (!file) throw new Error("No file provided");
    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `${pathPrefix}/${filename}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  },

  // Upload multiple images concurrently
  uploadMultipleFiles: async (fileList, pathPrefix = 'gallery') => {
    const promises = Array.from(fileList).map(file => storageService.uploadFile(file, pathPrefix));
    return await Promise.all(promises);
  }
};
