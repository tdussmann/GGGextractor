// TODO: Replace with your actual Google Cloud Function URL after deployment
const CLOUD_FUNCTION_URL = 'https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/extractGrid';

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
      throw new Error(`Cloud Function returned an error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    if (!data.text) {
      throw new Error('Invalid response from Cloud Function.');
    }

    return data.text;
  } catch (error) {
    console.error("Error calling Cloud Function:", error);
    throw new Error("Failed to communicate with the backend service.");
  }
};
