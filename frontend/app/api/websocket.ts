
import {API_BASE_URL} from '../config'


export function initWebSocket(clientId: number, onMessage: (message: any) => void): SharedWorker {
  const worker = new SharedWorker('/workers/shared-webSocket.js');
  
  worker.port.start();

  // You can send some initial data
  worker.port.postMessage({
    type: 'init',
    url: API_BASE_URL
  });

    worker.port.postMessage({
    type: 'login',
    url: API_BASE_URL
  });

  worker.port.onmessage = (event) => {
    onMessage(event.data);
  };

  return worker;
}
