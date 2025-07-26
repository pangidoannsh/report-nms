const fs = require("fs");
const dayjs = require("dayjs");

function storePdf(file) {
    const folder = "generate";
    const filename = `${folder}/${dayjs().format("YYYYMMDDHHmmss")}.pdf`;

    // Pastikan folder ada
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }

    // Simpan file PDF
    fs.writeFileSync(filename, file);
    return filename;
}

module.exports = {
    storePdf
}