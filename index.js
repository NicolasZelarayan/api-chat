require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');

const app = express();
const port = 3000;

// Configurar CORS, definiendo los orígenes permitidos
const allowedOrigins = ['http://localhost:3000', 'http://localhost:8080','http://127.0.0.1:5501','http://127.0.0.1','http://127.0.0.1:5500','http://127.0.0.1:5501/index.html','http://test.synagro.com.ar'];
app.use(cors({
  origin: function (origin, callback) {
    // Permitir solicitudes desde los dominios en la lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por CORS'));
    }
  }
}));

app.use(express.json());

// Inicializa OpenAI con tu clave de API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware para validar API key en las solicitudes
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === process.env.MY_API_KEY) {
    next(); // La API key es válida
  } else {
    res.status(403).json({ error: 'Acceso no autorizado. API key inválida.' });
  }
});

app.post('/ask', async (req, res) => {
  try {
    const thread = await openai.beta.threads.create();
    
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Por favor ingrese una pregunta.' });
    }

    const message = await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: question,
    });

    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: 'asst_qvY3YVUh2u3Evu16hcGXgqtP',
    });

    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(run.thread_id);
      const response = messages.data
        .reverse()
        .find((msg) => msg.role === 'assistant')
        ?.content[0].text.value;

      res.json({ answer: response });
    } else {
      res.status(500).json({ error: 'Run failed or is still in progress' });
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
