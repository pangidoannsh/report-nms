const { default: axios } = require("axios")

// const api_url = "http://202.10.56.218:3030/api/v1"
const api_url = "http://nmsau.tigabersama.co.id:3030/api/v1"

const api = axios.create({
    baseURL: api_url
})

module.exports = {
    api
}