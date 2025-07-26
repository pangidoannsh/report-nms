const dayjs = require('dayjs')
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore")
dayjs.extend(isSameOrBefore);

const getDateRange = (startDate, endDate) => {
    const result = [];
    let current = dayjs(startDate);
    const end = dayjs(endDate);

    while (current.isSameOrBefore(end, 'day')) {
        result.push(current.format('DD-MM'));
        current = current.add(1, 'day');
    }

    return result;
};

module.exports = {
    getDateRange
}