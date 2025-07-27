const dayjs = require("dayjs");
const { api } = require("./config");
const { getDateRange } = require("./utils");

async function _getDataTraffic(access_token, start_date, end_date) {
    const res = await api.get("router-export-raw", {
        params: { access_token, start_date, end_date }
    })
    return res.data.data ?? [];
}

function fixedMegabits(byte) {
    const toMb = byte * 8 / (1_000_000)
    if (toMb >= 1) {
        return Math.floor(toMb + 0.4);
    } else {
        return Number(toMb.toFixed(2));
    }
}

async function getReport(access_token, start_date, end_date) {
    const trafficData = await _getDataTraffic(access_token, start_date, end_date);
    const routerList = trafficData.map(t => {
        const RxData = t.RxData ?? [];
        const TxData = t.TxData ?? [];
        const MaxTxData = t.MaxTxData ?? [];
        const MaxRxData = t.MaxRxData ?? [];
        const avgDownload = RxData.length > 0 ? RxData.reduce((curr, prev) => curr + prev.Y, 0) / RxData.length : 0;
        const avgUpload = TxData.length > 0 ? TxData.reduce((curr, prev) => curr + prev.Y, 0) / TxData.length : 0;
        return {
            name: t.Title,
            // averageDownload: RxData.map(data => Number(data.Y.toFixed(2))),
            // averageUpload: TxData.map(data => Number(data.Y.toFixed(2))),
            download: MaxRxData.map(data => Number(data.Y.toFixed(2))),
            upload: MaxTxData.map(data => Number(data.Y.toFixed(2))),
            labels: t.MaxRxData ? MaxRxData.map(data => dayjs(data.Date).format("DD-MM")) : t.MaxTxData ? MaxTxData.map(data => dayjs(data.Date).format("DD-MM")) : getDateRange(start_date, end_date),
            max: t.Max,
            currentDownload: t.CurrentRxData,
            currentUpload: t.CurrentTxData,
            avgUpload: avgUpload.toFixed(1),
            avgDownload: avgDownload.toFixed(1),
            bandwidth: fixedMegabits((t.Bandwidth || 0) * 8 / 1_000_000)
        }
    })
    return routerList;
}

module.exports = {
    getReport
}
// main();