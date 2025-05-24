import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export function generateIdCardPDF(user) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: [350, 200],
                margin: 20
            });

            const filePath = path.join(
                "temp",
                `IDCard_${user.digitalIdNumber}.pdf`
            );

            // Ensure temp folder exists
            fs.mkdirSync("temp", { recursive: true });

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Background (optional)
            doc.rect(0, 0, 350, 200).fill("#f5f5f5");

            // Header
            doc
                .fillColor("#333")
                .fontSize(18)
                .text("Saylani Welfare ID Card", { align: "center" });

            // User Image (assume URL is accessible or skip if not local)
            // You can add user photo if you want, for now skip

            // User details
            doc
                .fontSize(12)
                .fillColor("#000")
                .text(`Name: ${user.fullName}`, 20, 60)
                .text(`Course: ${user.course}`, 20, 80)
                .text(`ID No: ${user.digitalIdNumber}`, 20, 100)
                .text(`Issue Date: ${new Date().toLocaleDateString()}`, 20, 120);

            // QR Code placeholder (optional)
            doc
                .rect(270, 60, 60, 60)
                .stroke();

            doc.fontSize(10).fillColor("#666").text("QR Code Here", 280, 90);

            doc.end();

            stream.on("finish", () => {
                resolve(filePath);
            });

            stream.on("error", (err) => {
                reject(err);
            });

        } catch (err) {
            reject(err);
        }
    });
}
