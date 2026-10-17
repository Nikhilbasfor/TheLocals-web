import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export const storageService = {
  // Upload any file to Firebase Storage and return its public URL
  uploadFile: async (file, pathPrefix = 'uploads') => {
    if (!file) throw new Error("No file provided");
    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `${pathPrefix}/${filename}`);
    
    try {
      const metadata = { contentType: file.type || 'application/octet-stream' };
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err) {
      console.error("Firebase Storage Upload Error:", err);
      if (err.code === 'storage/unauthorized') {
        throw new Error("Permission Denied (storage/unauthorized): Firebase Storage Security Rules blocked this upload. In Firebase Console > Storage > Rules, make sure rules allow write (e.g. 'allow read, write: if true;' or 'if request.auth != null;').");
      }
      if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
        throw new Error("Browser CORS Blocked: Google Cloud Storage requires CORS to be enabled for web uploads. See console for details or paste an image/PDF URL directly.");
      }
      throw err;
    }
  },

  // Upload multiple images concurrently
  uploadMultipleFiles: async (fileList, pathPrefix = 'gallery') => {
    const promises = Array.from(fileList).map(file => storageService.uploadFile(file, pathPrefix));
    return await Promise.all(promises);
  }
};
