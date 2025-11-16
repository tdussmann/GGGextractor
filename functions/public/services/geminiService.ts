const CLOUD_FUNCTION_URL = '/api/extractGrid';

export const extractGridFromImage = async (imageBase64: string, mimeType: string): Promise<string> => {
  try {
    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageBase64, mimeType }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned an error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    if (!data.text) {
      throw new Error('Invalid response from API.');
    }

    return data.text;
  } catch (error) {
    console.error("Error calling API:", error);
    throw new Error("Failed to communicate with the backend service.");
  }
};