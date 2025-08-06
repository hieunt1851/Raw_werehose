const ROBOFLOW_API_KEY = 'uYUCzsUbWxWRrO15iar5';
const ROBOFLOW_MODEL_URL = '/proxy-raw-meat/3';

export interface RoboflowPrediction {
  predictions: Array<{
    class: string;
    confidence: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  time: number;
}

export interface RoboflowError {
  error: string;
}

export class RoboflowService {
  static async predictMaterial(imageUrl: string): Promise<RoboflowPrediction | RoboflowError> {
    try {
      const response = await fetch(`${ROBOFLOW_MODEL_URL}?api_key=${ROBOFLOW_API_KEY}&image=${encodeURIComponent(imageUrl)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Roboflow API error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async predictMaterialFromBase64(base64Image: string): Promise<RoboflowPrediction | RoboflowError> {
    // Helper to convert image URL to base64
    async function urlToBase64(url: string): Promise<string> {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // Remove data URL prefix
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    try {
      let base64 = base64Image;
      // If input is a URL, convert to base64
      if (base64.startsWith('http://') || base64.startsWith('https://')) {
        base64 = await urlToBase64(base64);
      } else if (base64.startsWith('data:')) {
        base64 = base64.split(',')[1];
      }
      const response = await fetch(`${ROBOFLOW_MODEL_URL}?api_key=${ROBOFLOW_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: base64
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data
    } catch (error) {
      console.error('Roboflow API error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}