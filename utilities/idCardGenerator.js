import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import axios from "axios";

export async function generateIdCardPDF(user) {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: [350, 200],
                margin: 20,
            });

            // Ensure temp folder exists
            const tempDir = path.join("temp");
            fs.mkdirSync(tempDir, { recursive: true });

            const filePath = path.join(tempDir, `IDCard_${user.digitalIdNumber}.pdf`);
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Background
            doc.rect(0, 0, 350, 200).fill("#f5f5f5");

            // Header text
            doc
                .fillColor("#333")
                .fontSize(18)
                .text("Saylani Welfare ID Card", { align: "center" });

            // User Image
            try {
                // Download image buffer
                const response = await axios.get(user.imageURL, {
                    responseType: "arraybuffer",
                });
                const imageBuffer = Buffer.from(response.data, "binary");

                // Add image (scale and position)
                doc.image(imageBuffer, 270, 20, { width: 60, height: 60, fit: [60, 60], align: "center" });
            } catch (err) {
                console.error("Failed to load user image:", err);
                // You can put placeholder or ignore
            }

            // User details text
            doc
                .fontSize(12)
                .fillColor("#000")
                .text(`Name: ${user.fullName}`, 20, 60)
                .text(`Course: ${user.course}`, 20, 80)
                .text(`ID No: ${user.digitalIdNumber}`, 20, 100)
                .text(`Issue Date: ${new Date().toLocaleDateString()}`, 20, 120);

            // Prepare QR code data - encode user info as JSON string
            const qrData = JSON.stringify({
                fullName: user.fullName,
                cnic: user.cnic,
                email: user.email,
                phone: user.phone,
                address: user.address,
                course: user.course,
                digitalIdNumber: user.digitalIdNumber,
            });

            // Generate QR code as Data URL
            const qrCodeDataUrl = await QRCode.toDataURL(qrData, { margin: 1, width: 100 });

            // Convert Data URL to buffer
            const qrImageBuffer = Buffer.from(qrCodeDataUrl.split(",")[1], "base64");

            // Draw QR code on PDF
            doc.image(qrImageBuffer, 270, 100, { width: 60, height: 60 });

            doc.end();

            stream.on("finish", () => resolve(filePath));
            stream.on("error", (err) => reject(err));
        } catch (err) {
            reject(err);
        }
    });
}
