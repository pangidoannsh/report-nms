const express = require("express");
const app = express();
const cors = require('cors');
const { getReport } = require("./service");
const { generatePdfFromRouters } = require("./generatePdf");
const { loadPdf, filenameByDateRange, storePdf } = require("./fileStorage");

app.use(cors())

app.get("/", (_, res) => {
    res.send("Report INMS AU Service")
})

app.get("/print-report", async (req, res) => {
    try {
        const { token, start_date, end_date } = req.query;
        const loadCacheFile = loadPdf(filenameByDateRange(start_date, end_date));
        let pdfBuffer = null;
        if (loadCacheFile) {
            pdfBuffer = loadCacheFile;
        } else {
            const report = await getReport(token, start_date, end_date);
            pdfBuffer = await generatePdfFromRouters(report, start_date, end_date);
            storePdf(pdfBuffer, start_date, end_date);
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="report.pdf"');

        res.send(Buffer.from(pdfBuffer));
    } catch (e) {
        res.status(e.response?.status || 500).send(e.message);
    }
})

app.listen(3000, () => console.log("Report INMS AU Service Running on http://localhost:3000"));