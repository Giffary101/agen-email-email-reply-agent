import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function generateEmailReply(senderName: string, emailContent: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

    const systemPrompt = `Kamu adalah asisten eksekutif digital yang sangat profesional. 
Tugasmu adalah membaca email masuk dan menyusun draf balasan.
Aturan ketat:
1. Gunakan bahasa Indonesia yang formal, ramah, dan profesional.
2. Jangan pernah memberikan janji, tanggal.
3. Kamu boleh mengirimkan opini pribadi, tapi dengan bahasa yang sesuai nomoer 1.
4. Selalu akhiri dengan sapaan hormat dari "Tim Asisten Virtual".
5. Format langsung sebagai isi email, tanpa pembuka meta seperti "Berikut adalah balasannya".`;

    const userPrompt = `Pengirim: ${senderName}\nIsi Email:\n${emailContent}\n\nBuatkan draf balasan untuk email di atas.`;

    try {
        const result = await model.generateContent([systemPrompt, userPrompt]);
        return result.response.text();
    } catch (error) {
        console.error("Gagal menghasilkan balasan:", error);
        throw error;
    }
}