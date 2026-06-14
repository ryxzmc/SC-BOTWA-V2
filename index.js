const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const config = require('./config');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const text = m.message.conversation || m.message.extendedTextMessage?.text || '';
        const from = m.key.remoteJid;

        
        if (text === '!menu') {
            await sock.sendMessage(from, {
                text: `🩸 *SHIROKO BOT MENU*\n\n!menu - Liat menu\n!cek [link] - Cek link penipu\n!help - Bantuan\nBot anti penipu aktif 24 jam`
            });
        }

        
        if (text.includes('http') && text.includes('bit.ly')) {
            await sock.sendMessage(from, {
                text: `⚠️ HATI-HATI! Link bit.ly sering dipake penipu.\nJangan klik sembarangan ya kak!`
            });
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode!== DisconnectReason.loggedOut;
            console.log('Koneksi putus, nyambung lagi...', shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('🩸 Bot Shiroko Online!');
        }
    });
}

startBot();
