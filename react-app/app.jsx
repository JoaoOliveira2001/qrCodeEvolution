function App() {
  const [instance, setInstance] = React.useState("");
  const [apiKey, setApiKey] = React.useState("");
  const [qrCode, setQrCode] = React.useState(null);
  const [countdown, setCountdown] = React.useState(30);
  const [logs, setLogs] = React.useState([]);
  const [connected, setConnected] = React.useState(false);

  const baseUrl = 'http://145.223.31.139:8080';

  const addLog = (msg, type='info') => {
    setLogs(prev => [...prev, {time: new Date().toLocaleTimeString(), msg, type}]);
  };

  const generateQRCode = async () => {
    if (!instance || !apiKey) return;
    try {
      // verifica se ja esta conectado
      const statusRes = await fetch(`${baseUrl}/instance/connectionState/${instance}`, {
        method: 'GET',
        headers: { 'apikey': apiKey }
      });
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.instance.state === 'open') {
          setConnected(true);
          addLog('WhatsApp já conectado', 'success');
          return;
        }
      }

      const res = await fetch(`${baseUrl}/instance/connect/${instance}`, {
        method: 'GET',
        headers: { 'apikey': apiKey }
      });
      if (!res.ok) {
        addLog(`Erro ao conectar: ${res.status}`, 'error');
        return;
      }
      const data = await res.json();
      if (!data.code) {
        addLog('QR Code não disponível', 'error');
        return;
      }
      setQrCode(data.code);
      setConnected(false);
      addLog('QR Code obtido', 'success');
      setCountdown(30);
    } catch(err) {
      console.error(err);
      addLog(`Erro: ${err.message}`, 'error');
    }
  };

  React.useEffect(() => {
    if (qrCode === null) return;
    const id = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(id);
          generateQRCode();
          return 30;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [qrCode]);

  React.useEffect(() => {
    if (!instance || !apiKey) return;
    let interval = setInterval(async () => {
      try {
        const response = await fetch(`${baseUrl}/instance/connectionState/${instance}`, {
          method: 'GET',
          headers: {'apikey': apiKey}
        });
        if (response.ok) {
          const data = await response.json();
          setConnected(data.instance.state === 'open');
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [instance, apiKey]);

  React.useEffect(() => {
    if (connected) {
      setQrCode(null);
    }
  }, [connected]);

  React.useEffect(() => {
    if (!qrCode) return;
    const canvas = document.getElementById('qrCanvas');
    if (canvas) {
      QRCode.toCanvas(canvas, qrCode, { width: 180, height: 180 }, (err) => {
        if (err) {
          addLog(`Erro ao gerar QR: ${err.message}`, 'error');
        }
      });
    }
  }, [qrCode]);

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-lg font-bold text-center text-gray-800 dark:text-gray-200">Conector WhatsApp</h1>
      <div className="space-y-2">
        <input className="w-full p-2 border rounded" placeholder="Instância" value={instance} onChange={e => setInstance(e.target.value)} />
        <input className="w-full p-2 border rounded" placeholder="API Key" value={apiKey} onChange={e => setApiKey(e.target.value)} />
        <button className="w-full bg-purple-600 text-white p-2 rounded" onClick={generateQRCode}>Gerar QR Code</button>
      </div>
      {connected && <p className="text-center text-green-600">Conectado</p>}
      {!connected && qrCode && (
        <div className="text-center space-y-2">
          <canvas id="qrCanvas" />
          <p className="text-sm">Atualizando em: {countdown}s</p>
        </div>
      )}
      <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded h-40 overflow-auto">
        {logs.map((log, idx) => (
          <div key={idx} className="text-xs font-mono text-gray-700 dark:text-gray-300">
            [{log.time}] {log.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
