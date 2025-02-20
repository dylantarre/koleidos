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
    if (!isValidUrl(urlString)) return false;

    // Add protocol if missing
    let urlToTest = urlString.trim().toLowerCase();
    if (!urlToTest.startsWith('http://') && !urlToTest.startsWith('https://')) {
      urlToTest = `https://${urlToTest}`;
    }

    // Use a proxy to avoid CORS issues
    const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(urlToTest);
    const response = await fetch(proxyUrl);
    
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.status.http_code === 200;
  } catch (error) {
    console.error('Error checking website availability:', error);
    return false;
  }
}