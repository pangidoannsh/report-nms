const express = require("express");
const app = express();
const cors = require('cors');
const { getReport } = require("./service");
const { generatePdfFromRouters } = require("./generatePdf");

app.use(cors())

app.get("/", (_, res) => {
    res.send("Report INMS AU Service")
})

app.get("/print-report", async (req, res) => {
    try {
        const { token, start_date, end_date } = req.query;
        const report = await getReport(token, start_date, end_date);
        const pdfBuffer = await generatePdfFromRouters(report, start_date, end_date);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');

        res.send(Buffer.from(pdfBuffer));
    } catch (e) {
        res.status(500).send(e.message);
    }
})

app.listen(3000, () => console.log("Report INMS AU Service Running on http://localhost:3000"));