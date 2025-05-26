import { sleep } from './helpers';

export const isValidFileType = (file: File): boolean => {
  const acceptedTypes = ['text/plain', 'text/markdown'];
  const acceptedExtensions = ['.txt', '.md'];
  
  // Check MIME type
  if (acceptedTypes.includes(file.type)) {
    return true;
  }
  
  // Check file extension
  const fileName = file.name.toLowerCase();
  return acceptedExtensions.some(ext => fileName.endsWith(ext));
};

export const simulateFileUpload = async (
  progressCallback: (progress: number) => void,
  fileSize: number
): Promise<void> => {
  // Simulate different upload speeds based on file size
  const totalSteps = 10;
  const baseDelay = Math.min(300, Math.max(100, fileSize / 10240));
  
  for (let i = 1; i <= totalSteps; i++) {
    // Randomize the progress a bit to make it look more realistic
    const variableFactor = 0.7 + Math.random() * 0.6; // between 0.7 and 1.3
    await sleep(baseDelay * variableFactor);
    
    const currentProgress = Math.floor((i / totalSteps) * 100);
    progressCallback(currentProgress);
  }
  
  // Ensure we reach 100%
  progressCallback(100);
  
  // Add a small delay at the end to make it feel more realistic
  await sleep(300);
};