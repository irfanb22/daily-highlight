export const isValidFileType = (file: File): boolean => {
  const acceptedTypes = ['text/plain', 'application/json'];
  const acceptedExtensions = ['.txt', '.json'];
  
  // Check MIME type
  if (acceptedTypes.includes(file.type)) {
    return true;
  }
  
  // Check file extension
  const fileName = file.name.toLowerCase();
  return acceptedExtensions.some(ext => fileName.endsWith(ext));
};