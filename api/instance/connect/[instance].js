export default async function handler(req, res) {
  const { instance } = req.query;
  const apiKey = req.headers['apikey'] || req.query.apikey || '';

  try {
    const response = await fetch(`http://145.223.31.139:8080/instance/connect/${instance}`, {
      method: 'GET',
      headers: { apikey: apiKey }
    });
    const data = await response.text();
    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({ error: 'proxy_error', message: err.message });
  }
}
