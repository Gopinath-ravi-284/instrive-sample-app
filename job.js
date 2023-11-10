var cron = require('node-cron');
const MongoClient = require('mongodb').MongoClient;
const excel = require('exceljs');
const workbook = new excel.Workbook();
const basePath = '/home/gopinath/Desktop/'

cron.schedule("*/30 * * * *", async () => {
    MongoClient.connect('mongodb://localhost:27019', { useNewUrlParser: true, useUnifiedTopology: true }, async (err, client) => {
        let jsonData = [];
        if (err) {
            console.error('Error connecting to MongoDB:', err);
        }
        const db = client.db('MyDb');
        const data = await db.collection('fileNames').find().sort({created_at : -1}).limit(1).toArray();
        await workbook.xlsx.readFile(`${basePath}${data[0].filename}`);
        workbook.worksheets.forEach(async function(sheet) {
            let firstRow = sheet.getRow(1);
            if (!firstRow.cellCount) return;
            let keys = firstRow.values;
            sheet.eachRow((row, rowNumber) => {
                if (rowNumber == 1) return;
                let values = row.values
                let obj = {};
                for (let i = 1; i < keys.length; i ++) {
                    obj[keys[i]] = values[i];
                }
                if ( (obj.Name && obj.email_id && obj.Mobile) || (obj.Name != '' && obj.email_id !='' && obj.Mobile != ''))   {
                    obj.Status = 'active'
                } else {
                    obj.Status = 'inactive'
                    obj.error_log = 'Invalid name or email id or mobile number'
                }
                jsonData.push(obj);
            })
            await db.collection('user_details').insertMany(jsonData)
        });
        console.log('Job ran successfully')
    });
})