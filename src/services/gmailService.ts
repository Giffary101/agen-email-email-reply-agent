import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

export const gmail = google.gmail({ version: "v1", auth: oauth2Client });

// Pastikan instance 'gmail' sudah terinisialisasi dengan OAuth2Client sebelumnya
export async function enableGmailWatch() {
  try {
    const response = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        // Fokuskan agen hanya pada email yang masuk ke kotak masuk utama
        labelIds: ['INBOX'], 
        labelFilterAction: 'include',
        // Ganti 'NAMA_PROYEK_ANDA' dengan Project ID Google Cloud Anda
        topicName: 'projects/metal-coil-511704-s3/topics/notifikasi-gmail-baru'
      }
    });
    
    console.log('✅ Pemantauan Gmail aktif. History ID awal:', response.data.historyId);
    return response.data;
  } catch (error) {
    console.error('❌ Gagal mengaktifkan pemantauan Gmail:', error);
    throw error;
  }
}

export async function getEmailContent(messageId: string) {
    const res = await gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "full",
    });
    
    const snippet = res.data.snippet || "";
    const headers = res.data.payload?.headers;
    const sender = headers?.find(h => h.name === "From")?.value || "Klien";
    const subject = headers?.find(h => h.name === "Subject")?.value || "Tanpa Subjek";
    const threadId = res.data.threadId;

    return { snippet, sender, subject, threadId: threadId as string };
}

export async function createDraftReply(threadId: string, to: string, subject: string, bodyText: string) {
    const rawMessage = [
        `To: ${to}`,
        `Subject: Re: ${subject}`,
        `In-Reply-To: ${threadId}`,
        'Content-Type: text/plain; charset="UTF-8"',
        'MIME-Version: 1.0',
        '',
        bodyText,
    ].join('\n');

    const encodedMessage = Buffer.from(rawMessage)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    await gmail.users.drafts.create({
        userId: 'me',
        requestBody: {
            message: {
                raw: encodedMessage,
                threadId: threadId,
            }
        }
    });
    console.log("Draf balasan berhasil dibuat di Gmail.");
}