const fs = require("fs");
const dayjs = require("dayjs");
const __folderName = "generate";

function filenameByDateRange(startDate, endDate) {
    return `${dayjs(startDate).format("YYYYMMDD")}_${dayjs(endDate).format("YYYYMMDD")}.pdf`
}

function loadPdf(filename) {
    // const safeFileName = path.basename(filename);
    // const filePath = path.join(__dirname, 'generate', safeFileName);
    // console.log(filePath);
    const filePath = `${__folderName}/${filename}`
    if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        return buffer;
    } else {
        return null;
    }
}

function storePdf(file, startDate, endDate) {
    const nameByDate = filenameByDateRange(startDate, endDate)
    const filename = `${__folderName}/${nameByDate}`;

    // Pastikan folder ada
    if (!fs.existsSync(__folderName)) {
        fs.mkdirSync(__folderName, { recursive: true });
    }

    // Simpan file PDF
    fs.writeFileSync(filename, file);
    return filename;
}

module.exports = {
    storePdf, loadPdf, filenameByDateRange
}