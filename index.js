const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const http = require('http');

// Acceder a los secrets configurados en Railway
const BOT_TOKEN = process.env.BOT_TOKEN; // Token del bot de Discord
const N8N_API_KEY = process.env.N8N_API_KEY; // API key de n8n
const N8N_ENDPOINT = process.env.N8N_ENDPOINT; // Endpoint de la API de n8n

// Verificar que el token esté presente
if (!BOT_TOKEN) {
  console.error('Error: El token de Discord no está configurado correctamente.');
  process.exit(1); // Salir del proceso si no se encuentra el token
}

// Crear el cliente de Discord con las intenciones correctas
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

// Lista de IDs de canales donde el bot no deberá responder
const excludedChannels = ['1231991368549793873']; // Añade aquí los IDs de los canales que deseas excluir

// Evento cuando el bot está listo
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Evento para detectar cualquier mensaje en los canales donde está el bot
client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignorar mensajes de otros bots

  if (excludedChannels.includes(message.channel.id)) {
    console.log(`Mensaje en canal excluido: ${message.channel.name} (ID: ${message.channel.id})`);
    return;
  }

  const dayOfWeek = new Date().getDay();

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    message.reply("Hola, el fin de semana estamos ausentes, te responderemos el lunes.");
  } else {
    try {
      await axios.post(
        `${N8N_ENDPOINT}/webhook/discord-event`, 
        {
          content: message.content,
          author: message.author.username,
          channel: message.channel.name,
          timestamp: message.createdAt,
        },
        {
          headers: {
            Authorization: `Bearer ${N8N_API_KEY}`,
          },
        }
      );
      console.log('Mensaje enviado a n8n');
    } catch (error) {
      console.error('Error enviando el mensaje a n8n:', error);
    }
  }
});

// Iniciar sesión en Discord con el token del bot
client.login(BOT_TOKEN);

// Crear un servidor HTTP simple para mantener el Repl activo
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running!\n');
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
