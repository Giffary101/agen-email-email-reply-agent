import express from 'express';
import { getEmailContent, createDraftReply, gmail, enableGmailWatch } from './services/gmailService';
import { generateEmailReply } from './services/agentService';


const app = express();
app.use(express.json());

// 1. Tambahkan variabel penampung riwayat di LUAR fungsi app.post (di bagian atas berkas)
let lastHistoryId: string | null = null;

app.post('/webhook/gmail', async (req, res) => {
    // Selalu balas Google di awal agar tidak dikirim ulang
    res.status(200).send('Webhook diproses');

    try {
        const messageData = req.body.message?.data;
        if (!messageData) return;

        const decodedData = JSON.parse(Buffer.from(messageData, 'base64').toString('utf-8'));
        const currentHistoryId = decodedData.historyId;
        
        // Jika ini adalah sinyal pertama saat peladen baru menyala, 
        // kita hanya menyimpan ID-nya agar tidak memproses email lama.
        if (!lastHistoryId) {
            console.log(`Menyinkronkan radar... ID riwayat awal: ${currentHistoryId}`);
            lastHistoryId = currentHistoryId;
            return;
        }

        // 2. Minta daftar "apa saja yang berubah" sejak sinyal terakhir
        const historyResponse = await gmail.users.history.list({
            userId: 'me',
            startHistoryId: lastHistoryId
        });

        // Perbarui riwayat untuk sinyal berikutnya
        lastHistoryId = currentHistoryId;

        const historyRecords = historyResponse.data.history;
        if (!historyRecords) return; // Tidak ada perubahan berarti

        // 3. Cari HANYA kejadian "Pesan Baru Ditambahkan" (messagesAdded)
        for (const record of historyRecords) {
            // Jika trigger disebabkan oleh penghapusan label (labelsRemoved), blok ini akan dilewati (Loop terputus!)
            if (record.messagesAdded) {
                for (const item of record.messagesAdded) {
                    const messageId = item.message?.id;
                    if (!messageId) continue;

                    console.log(`\nEmail BENAR-BENAR BARU terdeteksi! (ID: ${messageId})`);
                    console.log("Mengekstrak email...");
                    
                    const { snippet, sender, subject, threadId } = await getEmailContent(messageId);
                    
                    console.log("Otak agen sedang menyusun balasan...");
                    const aiReplyText = await generateEmailReply(sender, snippet);
                    
                    console.log("Menyimpan draf ke Gmail...");
                    const emailAddressMatch = sender.match(/<(.+)>/);
                    const toEmail = emailAddressMatch ? emailAddressMatch[1] : sender;

                    await createDraftReply(threadId, toEmail, subject, aiReplyText);
                    
                    // Menghapus label UNREAD (Ini akan memicu notifikasi baru dari Google, 
                    // tapi kode kita sekarang sudah kebal karena itu bukan kejadian messagesAdded)
                    await gmail.users.messages.modify({
                        userId: 'me',
                        id: messageId,
                        requestBody: { removeLabelIds: ['UNREAD'] }
                    });
                    
                    console.log("✅ Selesai! Draf balasan berhasil disiapkan.");
                }
            }
        }
    } catch (error) {
        console.error('Terjadi kesalahan pada eksekusi agen:', error);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`🤖 Agen Email berjalan di port ${PORT}`);
    await enableGmailWatch();
    console.log(`Menunggu notifikasi email masuk di /webhook/gmail...`);
});