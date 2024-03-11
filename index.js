const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const dotenv = require("dotenv");
const app = express();
const PORT = 3000;

// Middleware para analisar o corpo das solicitações
app.use(bodyParser.json());

// Dados simulados de alertas
let alerts = [];
const TELEGRAM_BOT_TOKEN = dotenv.config().parsed.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = dotenv.config().parsed.TELEGRAM_CHAT_ID;
// Função para enviar mensagem para o bot do Telegram
async function sendTelegramMessage(message) {
  try {
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
      }
    );
  } catch (error) {
    console.error("Erro ao enviar mensagem para o Telegram:", error);
  }
}

app.get("/", (req, res) => {
  const html = `
    <html>
      <head>
        <title>GitHub Webhook</title>
        <style>
          /* Estilos omitidos para brevidade */
        </style>
      </head>
      <body>
        <div class="tabs">
          <div class="tab" onclick="showAlerts()">Alertas</div>
          <div class="tab" onclick="showPullRequests()">Pull Requests</div>
        </div>
        <div id="content"></div>
        <script>
          /* Scripts omitidos para brevidade */
        </script>
      </body>
    </html>
  `;

  // Retorna a página HTML
  res.send(html);
});

// Rota para exibir alertas
app.get("/alerts", (req, res) => {
  console.log("Recebido pedido de alertas");
  res.send(alerts); // Exibe os alertas na tela
});

let responseHtml = ""; // Definindo a variável responseHtml em um escopo mais amplo

// Rota para exibir dados de um pull request
app.post("/pull-requests", async (req, res) => {
  console.log("Recebido pedido POST de pull requests");

  const prData = req.body; // Dados do pull request enviados pelo GitHub
  console.log(prData);
  // Extrair os dados importantes do pull request
  const prInfo = {
    title: prData.pull_request.title,
    author: prData.pull_request.user.login,
    url: prData.pull_request.html_url,
    createdAt: prData.pull_request.created_at,
    updatedAt: prData.pull_request.updated_at,
  };

  // Montar a resposta com os dados do pull request
  responseHtml = `
    <h2>Pull Request</h2>
    <ul>
      <li><strong>Title:</strong> ${prInfo.title}</li>
      <li><strong>Author:</strong> ${prInfo.author}</li>
      <li><strong>URL:</strong> <a href="${prInfo.url}" target="_blank">${prInfo.url}</a></li>
      <li><strong>Created At:</strong> ${prInfo.createdAt}</li>
      <li><strong>Updated At:</strong> ${prInfo.updatedAt}</li>
    </ul>
  `;

  // Enviar dados do pull request para o bot do Telegram
  await sendTelegramMessage(
    `Novo Pull Request: ${prInfo.title} (${prInfo.url})`
  );

  res.redirect("/view-pull-requests");
});

// Rota para exibir os dados do pull request
app.get("/view-pull-requests", (req, res) => {
  console.log("Recebido pedido GET de pull requests");
  res.send(responseHtml); // Enviando a resposta HTML
});

// Rota para receber alertas de commits na master
app.post("/webhook", async (req, res) => {
  const branch = req.body.ref.split("/").pop(); // Extrai o nome da branch do payload
  if (branch === "master" || branch === "main") {
    const { body } = req;
    const { login } = body.sender;
    const { added, removed, modified } = body.head_commit;
    const allFiles = added.concat(removed, modified).join(", ");
    alerts.push("Novo commit na branch master!");
    const message = `ATENÇÃO: Novo commit na branch master! Feito por ${login}. Arquivos alterados: ${allFiles}`;

    await sendTelegramMessage(message);
  }
  res.send("Cuidado com a branch master!"); // Envia uma resposta
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor está rodando na porta ${PORT}`);
});
