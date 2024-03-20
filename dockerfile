# Use uma imagem base que inclua o ambiente de execução da sua aplicação
FROM node:20

# Defina o diretório de trabalho na imagem
WORKDIR /usr/src/app

# Copie todos os arquivos da sua aplicação para o diretório de trabalho na imagem
COPY . .

# Instale as dependências da sua aplicação
RUN npm install

# Exponha a porta que sua aplicação usa
EXPOSE 3000

# Defina a variável de ambiente necessária para sua aplicação (se houver)
ENV TELEGRAM_BOT_TOKEN=6862748980:AAHcVlkCq4-UnCPQ0dlMCQwAEuESMXujaYU
ENV TELEGRAM_CHAT_ID=-4147810479
# Comando para iniciar sua aplicação quando o contêiner for iniciado
CMD ["npm", "start"]