const fs = require('fs')

const DATABASE = 'database.json'

const saveToJson = (data) => fs.writeFileSync(DATABASE, JSON.stringify({ lastUpdate: Date.now(), data }))

function getAll() {
    try {
        const database = fs.readFileSync(DATABASE)
        const dbParse = JSON.parse(database)
        return dbParse.data;
    } catch (e) {
        console.error(`${DATABASE} not found`);
        return [];
    }
}

function store(payload) {
    try {
        const getAllData = getAll()
        getAllData.push({ ...payload, id: Date.now() })
        saveToJson(getAllData)
    } catch (e) {
        console.error(e);
    }

}

function remove(id) {
    try {
        const getAllData = getAll()
        const newData = getAllData.filter(data => data.id !== id)
        saveToJson(newData)
    } catch (e) {
        console.error(e);
    }
}



module.exports = {
    store,
    remove,
    getAll
}