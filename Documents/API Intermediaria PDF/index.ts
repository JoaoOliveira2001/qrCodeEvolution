import express, { Request, Response } from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3000;

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

app.use(express.json());
app.use('/pdfs', express.static(tempDir));

app.post('/gerar-boleto', async (req: Request, res: Response) => {
  const { numeroFatura } = req.body;

  if (!numeroFatura) {
    return res.status(400).json({ error: 'Número da fatura é obrigatório.' });
  }

  try {
    const response = await axios.post(
      'https://pl-api-hml.metropolitana.sgusuite.com.br/api/procedure/p_prcssa_dados/p_json_busca_boleto',
      { numeroFatura },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'insomnia/11.0.0',
          'apikey': '12c94045-8349-44e0-86b5-3e2b53b2e79a',
        },
      }
    );

    console.log('Resposta da API externa:', response.data);

    const base64PDF = response.data.content?.[0]?.file;

    if (!base64PDF) {
      return res.status(500).json({ error: 'Arquivo base64 não encontrado.' });
    }

    const fileName = `${uuidv4()}.pdf`;
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(base64PDF, 'base64'));

    const link = `http://localhost:${PORT}/pdfs/${fileName}`;
    return res.json({ link });

  } catch (error: any) {
    console.error('Erro ao gerar boleto:', error.response?.data || error.message || error);
    return res.status(500).json({ error: 'Erro ao gerar boleto.' });
  }
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
