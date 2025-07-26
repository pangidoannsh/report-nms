const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { PDFDocument, StandardFonts, rgb: pdfLibRgb } = require('pdf-lib');
const rgb = (red, green, blue) => {
    return pdfLibRgb(red / 255, green / 255, blue / 255)
}
const { storePdf } = require('./storage');
const fs = require("fs");
const dayjs = require('dayjs');
require("dayjs/locale/id")
dayjs.locale("id");

const margin = 20;
const padding = 20;
// Ukuran halaman PDF (A4 dalam point: 595 x 842)
const pageWidth = 595;
const pageHeight = 842;
const contentWidth = pageWidth - (margin * 2);
// Ukuran chart
const chartWidth = contentWidth;
const chartHeight = 160;

const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width: chartWidth,
    height: chartHeight,
    backgroundColour: 'white',
});

const lineChartColorGradient = (from, to) => {
    return (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) {
            return "rgba(0,0,0,0)";
        }
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, from);
        gradient.addColorStop(1, to);
        return gradient;
    }
}

async function renderChart(router) {
    const labels = router.labels
    return await chartJSNodeCanvas.renderToBuffer({
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: "Download",
                    data: router.download,
                    backgroundColor: lineChartColorGradient("rgba(25, 202, 63, 0.7)", "rgba(25, 202, 63, 0.2)"),
                    borderColor: "rgba(25, 202, 63, 1)",
                    fill: true,
                    borderWidth: 0.5,
                    pointRadius: 0,
                    tension: 0.4
                },
                {
                    label: "Upload",
                    data: router.upload,
                    backgroundColor: lineChartColorGradient("rgba(0, 117, 255, 0.7)", "rgba(0, 117, 255, 0.2)"),
                    borderColor: "rgba(0, 117, 255, 1)",
                    fill: true,
                    borderWidth: 0.5,
                    pointRadius: 0,
                    tension: 0.4
                },
            ]
        },
        options: {
            devicePixelRatio: 2,
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', display: false }
            },
            scales: {
                x: {
                    border: {
                        dash: ({ tick }) => (tick.value === 0 || tick.value === labels.length - 1) ? [] : [4, 4],
                    },
                    title: {
                        display: true,
                        text: 'Time (hour)',
                        font: { size: 6, weight: 'bold' },
                        color: "black"
                    },
                    ticks: {
                        font: { size: 6, weight: 'bold' },
                        minRotation: 90,
                        color: "black",
                        maxTicksLimit: 24
                    },
                    grid: {
                        color: (ctx) => {
                            const index = ctx.tick?.value;
                            if (index === 0 || index === labels.length - 1) return 'rgba(0,0,0,1)';
                            return 'rgba(0,0,0,0.2)';
                        },
                    }
                },
                y: {
                    border: {
                        dash: ({ tick }) => tick.value === 0 ? [] : [4, 4],
                    },
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '(Mbps)',
                        font: { size: 6, weight: 'bold' },
                        color: "black"
                    },
                    ticks: {
                        font: { size: 6, weight: 'bold' },
                        color: "black"
                    },
                    grid: {
                        color: (ctx) => {
                            if (ctx.tick.value === 0) return 'rgba(0,0,0,1)';
                            return 'rgba(0,0,0,0.2)';
                        },
                    }
                },
                yPercentage: {
                    display: true,
                    type: "linear",
                    position: "right",
                    ticks: {
                        maxTicksLimit: 6,
                        color: "black",
                        font: { size: 6, weight: 'bold' },
                        callback: (value) => `${value * 100}`
                    },
                    title: {
                        text: '(%)',
                        font: { size: 6, weight: 'bold' },
                        display: true,
                        color: "black",
                    },
                    suggestedMin: 0,
                    beginAtZero: true,
                }
            }
        }
    });
}

async function generatePdfFromRouters(routerList, start_date, end_date) {
    const pdfDoc = await PDFDocument.create();
    const newPage = () => pdfDoc.addPage([pageWidth, pageHeight]);

    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const spacePerChart = chartHeight + padding;
    function createFooter(pageNumber) {
        const fontSize = 10;
        page.drawText(pageNumber.toString(), {
            x: contentWidth,
            y: margin,
            size: fontSize,
            font: regularFont,
            color: rgb(0, 0, 0)
        });
    }
    async function createCover() {
        const coverBuffer = fs.readFileSync("./assets/cover.jpg");
        const cover = await pdfDoc.embedJpg(coverBuffer);
        page.drawImage(cover, {
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight
        })
        const range = dayjs(start_date).format('DD MMMM YYYY') + " - " + dayjs(end_date).format('DD MMMM YYYY');
        const rangeTextWidth = regularFont.widthOfTextAtSize(range, 16);
        page.drawText(range, {
            x: (pageWidth / 2) - (rangeTextWidth / 2),
            y: margin + 64,
            size: 16,
            font: regularFont,
            color: rgb(255, 255, 255)
        })
    }
    async function createHeader() {
        const logoBuffer = fs.readFileSync("./assets/logo_tni_au.png");
        const logo = await pdfDoc.embedPng(logoBuffer);
        const logoWidth = 20;
        const logoHeight = (logoWidth / logo.width) * logo.height;
        page.drawImage(logo, {
            x: margin,
            y: pageHeight - logoHeight - 10,
            width: logoWidth,
            height: logoHeight
        })
        page.drawText("R E P O R T", {
            x: margin + logoWidth + 4,
            y: (pageHeight - margin) - (logoHeight / 2) + 10,
            size: 5,
            font: regularFont,
            color: rgb(0, 67, 183)
        });
        page.drawText("M U L T I    R O U T E R    T R A F F I C    G R A P H E R", {
            x: margin + logoWidth + 4,
            y: (pageHeight - margin) - (logoHeight / 2) + 2,
            size: 6,
            font: font,
            color: rgb(0, 67, 183),
        });
    }

    function createChartLegend(yPosition) {
        const startPos = margin + 14
        // Upload
        page.drawRectangle({
            x: startPos,
            y: yPosition,
            width: 6,
            height: 6,
            color: rgb(0, 117, 255)
        })
        page.drawText("Upload (Mbps)", {
            x: startPos + 8,
            y: yPosition + 1,
            size: 6,
            font: font,
            color: rgb(0, 0, 0)
        });
        // Download
        page.drawRectangle({
            x: startPos + 60,
            y: yPosition,
            width: 6,
            height: 6,
            color: rgb(25, 202, 63)
        })
        page.drawText("Download (Mbps)", {
            x: startPos + 68,
            y: yPosition + 1,
            size: 6,
            font: font,
            color: rgb(0, 0, 0)
        });
    }

    async function createStatsInfo(yPosition, prop) {
        const { max, currentUpload, currentDownload, bandwidth, avgUpload, avgDownload } = prop
        let yPos = yPosition;
        const xStart = margin + 14
        const gap = 10;
        page.drawText("Max:", {
            x: xStart,
            y: yPos,
            size: 6,
            font: regularFont,
            color: rgb(0, 0, 0)
        });
        page.drawText("Current Upload:", {
            x: xStart,
            y: yPos - gap,
            size: 6,
            font: regularFont,
            color: rgb(0, 0, 0)
        });
        let mostLongText = "Current Download:"
        const textWidth = regularFont.widthOfTextAtSize(mostLongText, 6);
        page.drawText(mostLongText, {
            x: xStart,
            y: yPos - (gap * 2),
            size: 6,
            font: regularFont,
            color: rgb(0, 0, 0)
        });

        const col2XPos = xStart + textWidth + 48;
        let valueTextWidth = regularFont.widthOfTextAtSize(max + " Mbps", 6);
        page.drawText(max + " Mbps", {
            x: col2XPos - valueTextWidth,
            y: yPos,
            size: 6,
            font: regularFont,
            color: rgb(0, 0, 0)
        });
        valueTextWidth = regularFont.widthOfTextAtSize(currentUpload.replace("BPS", "bps"), 6);
        page.drawText(currentUpload.replace("BPS", "bps"), {
            x: col2XPos - valueTextWidth,
            y: yPos - gap,
            size: 6,
            font: regularFont,
            color: rgb(0, 0, 0)
        });
        valueTextWidth = regularFont.widthOfTextAtSize(currentDownload.replace("BPS", "bps"), 6);
        page.drawText(currentDownload.replace("BPS", "bps"), {
            x: col2XPos - valueTextWidth,
            y: yPos - gap * 2,
            size: 6,
            font: regularFont,
            color: rgb(0, 0, 0)
        });

        page.drawText("Bandiwdth:", {
            x: col2XPos + 32,
            y: yPos,
            size: 6,
            font: regularFont,
            color: rgb(0, 0, 0)
        });
        page.drawText("Average Upload:", {
            x: col2XPos + 32,
            y: yPos - gap,
            size: 6,
            font: regularFont,
            color: rgb(0, 0, 0)
        });
        mostLongText = "Average Download:"
        const textWidthCol2 = regularFont.widthOfTextAtSize(mostLongText, 6);
        page.drawText(mostLongText, {
            x: col2XPos + 32,
            y: yPos - (gap * 2),
            size: 6,
            font: regularFont,
            color: rgb(0, 0, 0)
        });
        const col3XPos = col2XPos + (textWidthCol2 * 2) + 48;
        valueTextWidth = regularFont.widthOfTextAtSize(bandwidth + " Mbps", 6);
        page.drawText(bandwidth + " Mbps", {
            x: col3XPos - valueTextWidth,
            y: yPos,
            size: 6,
            font: regularFont,
            color: rgb(0, 0, 0)
        });
        valueTextWidth = regularFont.widthOfTextAtSize(avgUpload + " Mbps", 6);
        page.drawText(avgUpload + " Mbps", {
            x: col3XPos - valueTextWidth,
            y: yPos - gap,
            size: 6,
            font: regularFont,
            color: rgb(0, 0, 0)
        });
        valueTextWidth = regularFont.widthOfTextAtSize(avgDownload + " Mbps", 6);
        page.drawText(avgDownload + " Mbps", {
            x: col3XPos - valueTextWidth,
            y: yPos - gap * 2,
            size: 6,
            font: regularFont,
            color: rgb(0, 0, 0)
        });
    }

    const startYPostiion = pageHeight - margin - 26
    let yPosition = startYPostiion;

    let page = newPage();

    // COVER
    await createCover();

    // CONTENT
    page = newPage();
    createHeader();
    let pageNumber = 2;
    createFooter(pageNumber);
    for (let i = 0; i < routerList.length; i++) {
        if (i !== 0 && i % 3 === 0) {
            page = newPage();
            createHeader();
            pageNumber++;
            createFooter(pageNumber);
            yPosition = startYPostiion;
        }
        const textYOffset = 12;
        const router = routerList[i];
        page.drawText((i + 1) + ". " + router.name, {
            x: margin + 2,
            y: yPosition - textYOffset,
            size: 10,
            font: font,
            color: rgb(0, 0, 0),
        });
        yPosition -= padding + 4;
        await createStatsInfo(yPosition, router);
        yPosition -= 36;
        createChartLegend(yPosition);
        const imageBuffer = await renderChart(router);
        const pngImage = await pdfDoc.embedPng(imageBuffer);
        page.drawImage(pngImage, {
            x: margin,
            y: yPosition - chartHeight - 4,
            width: chartWidth,
            height: chartHeight
        });
        yPosition -= spacePerChart - 10;
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes
    // const filename = storePdf(pdfBytes)
    // console.log(`✅ PDF berhasil dibuat dari router list: ${filename}`);
}

module.exports = { generatePdfFromRouters };