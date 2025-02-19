export function isValidUrl(urlString: string): boolean {
  try {
    const url = urlString.trim().toLowerCase();

    // Basic validation
    if (url.length === 0) return false;
    if (url.includes(' ') || url.includes('\t')) return false;

    // Add protocol if missing
    let urlToTest = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      urlToTest = `https://${url}`;
    }

    const parsedUrl = new URL(urlToTest);

    // Hostname must have at least one dot and valid characters
    if (!parsedUrl.hostname.includes('.')) return false;
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(parsedUrl.hostname)) return false;

    return true;
  } catch {
    return false;
  }
}

export async function checkWebsiteAvailability(urlString: string): Promise<boolean> {
  try {
    // For now, just validate the URL format
    // This is more reliable than trying to check availability
    // which can be affected by CORS and network issues
    return isValidUrl(urlString);
  } catch (error) {
    return false;
  }
}