// Local analysis API for color difference analysis
export function getLocalApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('localApiBaseUrl') || 'https://tastevn-ai-services.ig3.ai';
  }
  return 'https://tastevn-ai-services.ig3.ai';
}
export function setLocalApiBaseUrl(url: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('localApiBaseUrl', url);
  }
}
export interface AnalysisRequest {
  url1: string;
  url2?: string;
  base2?: string;
  product_kind: string;
  mode: string;
}

export interface AnalysisResponse {
  color_difference: number;
  [key: string]: any;
}

export async function analyzeImage(request: AnalysisRequest): Promise<AnalysisResponse> {
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout
  try {
    // Prepare request body: include url2 if present, else base2
    const body: any = {
      url1: request.url1,
      product_kind: request.product_kind,
      mode: request.mode
    };
    if (request.url2) {
      body.url2 = request.url2;
    } else if (request.base2) {
      body.base2 = request.base2;
    }
    const response = await fetch(`${getLocalApiBaseUrl()}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId); // Clear timeout if request completes
    
    if (!response.ok) {
      throw new Error(`Analysis API error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId); // Clear timeout on error
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Analysis API request timed out after 5 seconds');
    }
    
    console.error('Error calling local analysis API:', error);
    throw error;
  }
}

// Serial port API functions (for settings popup)
export async function listSerialPorts() {
  const response = await fetch(`${getLocalApiBaseUrl()}/ports`);
  if (!response.ok) throw new Error('Failed to fetch serial ports');
  return response.json();
}

export async function connectSerialPort(port: string, baudRate: number) {
  const response = await fetch(`${getLocalApiBaseUrl()}/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ port, baud_rate: baudRate })
  });
  if (!response.ok) throw new Error('Failed to connect to serial port');
  return response.json();
}

export function subscribeWeightStream(onWeight: (weight: string) => void, onError?: (err: any) => void) {
  const eventSource = new EventSource(`${getLocalApiBaseUrl()}/weight`);
  eventSource.onmessage = (event) => {
    onWeight(event.data);
  };
  eventSource.onerror = (err) => {
    if (onError) onError(err);
    eventSource.close();
  };
  return () => eventSource.close();
}

// Capture image from local camera
export async function captureLocalImage(): Promise<string> {
  const response = await fetch(`${getLocalApiBaseUrl()}/capture-image?mode=rtsp&rtsp_url=rtsp://169.254.140.61:554`, { method: 'GET' });
  if (!response.ok) throw new Error('Failed to capture image');
  const data = await response.json();
  if (!data.success || !data.image_url) throw new Error('Capture failed');
  return data.image_url;
} 