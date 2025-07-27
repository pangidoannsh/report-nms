const fs = require("fs");

function main() {
    const data = [
        {
            name: "John Doe",
            age: 30,
            active: true
        }
    ];
    const template = {
        lastUpdate: Date.now(),
        data
    }
    fs.writeFileSync("data.json", JSON.stringify(template, null, 2));

    console.log("File JSON berhasil dibuat:", "data.json");
}

main()