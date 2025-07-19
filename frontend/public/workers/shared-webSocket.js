const connections = [];
let ws = null;
let api_base_url = null

function broadcast(message, exclude) {
  connections.forEach((port) => {
    if (port !== exclude) {
      port.postMessage(message);
    }
  });
}

function initWebSocket() {
    if (!api_base_url) {
    console.warn('[Worker] API base URL not set yet.');
    return;
  }
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return;
  }
  ws = new WebSocket(`${api_base_url}/api/ws`);

  ws.onopen = () => broadcast({ type: "status", status: "connected" });
  ws.onmessage = (e) => broadcast({ type: "message", data: e.data });
  ws.onclose = () => {
    broadcast({ type: "status", status: "disconnected" });
    setTimeout(initWebSocket, 5000);
  };
  ws.onerror = (err) => console.error("[Worker] WS error:", err);
}

self.onconnect = (e) => {
  const port = e.ports[0];
  connections.push(port);
  port.start();

  port.postMessage({
    type: "status",
    status: ws && ws.readyState === WebSocket.OPEN ? "connected" : "disconnected",
  });

  port.onmessage = (event) => {
    const { type, ...data } = event.data;

    if (type === "disconnect") {
      const idx = connections.indexOf(port);
      if (idx !== -1) {
        connections.splice(idx, 1);
        console.log("[Worker] Port disconnected. Connections left:", connections.length);
      }
      return;
    }

    switch (type) {

      case "login":
        initWebSocket();
        break;
      case "logout":
        if (ws) {
          ws.close();
          ws = null;
        }
        break;
      case "read":
      case "sent_message":
        broadcast(event.data, port);
        break;
      case "message":
      case "start_typing":
      case "stop_typing":
      case "typing":
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(Object.assign({ type }, data)));
        } else {
          console.warn("[Worker] WS not open. Can't send.");
        }
        break;

        case "init":
          api_base_url = data.url
          initWebSocket()
          console.log("The base url is: ", data.url);
        break;
      default:
        console.warn("[Worker] Unknown message type:", type);
    }
  };

  port.onmessageerror = (err) => {
    console.error("[Worker] Port message error:", err);
  };
};
