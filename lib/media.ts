/**
 * Checks if a URL points to a video file
 */
export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
  const urlLower = url.toLowerCase();
  
  // Check for common video extensions
  if (videoExtensions.some(ext => urlLower.includes(ext))) {
    return true;
  }
  
  // Check for video MIME types in the URL (less common but possible)
  const videoMimePatterns = ['video/', 'application/octet-stream'];
  // This is a simple check - actual MIME type detection would require a request
  
  return false;
}

