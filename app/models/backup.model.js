const sql = require("./db.js");
const global = require("../constants/global.js");
const {execute} = require('@getvim/execute');
const dbConfig = require("../config/db.config.js");
const fs = require('fs');

function backup(tenantcode){
// pg_dump --file "C:\\Users\\Farhan Khan\\DOWNLO~1\\test.sql" --host "13.232.7.40" --port "5432" --username "postgres" --no-password --role "postgres" --format=p --encoding "UTF8" --verbose --schema "ibs_sthapatya" "ibs_property_db"
    execute(`ls -a`).then(async (data) => {
        console.log('successfully done')
        console.log(data);
    }).catch(async (err) => {
        console.log('err');   
        console.log(err);
    })
     
    // let DB_USER=dbConfig.USER;
    // let DB_NAME=dbConfig.DB;
    // let PGPASS=dbConfig.PASSWORD;
    // let HOST=dbConfig.HOST;
    // const date = new Date();
    // const currentDate = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}.${date.getHours()}.${date.getMinutes()}`;
    // //let uploadPath = process.env.FILE_UPLOAD_PATH + 'backup' + '/' + req.userinfo.tenantcode + '/' + req.params.id;
    // let uploadPath = `/home/files/backup/${tenantcode}`;
    
    // if (!fs.existsSync(`${uploadPath}`)) {
    //     fs.mkdirSync(`${uploadPath}`, { recursive: true });
    // }

    // if (!fs.existsSync(`${uploadPath}/${tenantcode}`)) {
    //     fs.mkdirSync(`${uploadPath}/${tenantcode}`, { recursive: true });
    // }
    // const fileName = `${uploadPath}/${tenantcode}/database-backup-${currentDate}.sql`;
    // console.log(fileName)
    // try {
    //     console.log(`PGPASSWORD="${PGPASS}" pg_dump -U ${DB_USER} -h ${HOST} -d ${DB_NAME} -n ${tenantcode} -f ${fileName} -F p --no-password`);
    //     execute(`cp -r /home/files/eeco/ ${uploadPath}/${tenantcode}/`,).then(async () => {
    //         console.log("copy done");
    //         execute(`PGPASSWORD="${PGPASS}" pg_dump -U ${DB_USER} -h ${HOST} -d ${DB_NAME} -f ${fileName} -F p --no-password`,).then(async () => {
    //             console.log("Finito");

    //             execute(`tar -cf database-backup-${currentDate}.tar -C ${uploadPath}/${tenantcode}/ .`,).then(async () => {
    //                 console.log("tar done");
    //                 execute(`rm -r ${uploadPath}/${tenantcode}`,).then(async () => {
    //                     console.log("remove done");
    //                     execute(`mv database-backup-${currentDate}.tar ${uploadPath}/`,).then(async () => {
    //                         console.log("move done");
    //                         return {success: true}
                           
    //                     }).catch(err => {
    //                         console.log(err);
    //                         return {success: false, errors : err}
    //                     })

    //                 }).catch(err => {
    //                     console.log(err);
    //                     return {success: false, errors : err}
    //                 })
    //             }).catch(err => {
    //                 console.log(err);
    //                 return {success: false, errors : err}
    //             })
    //         }).catch(err => {
    //             console.log(err);
    //             return {success: false, errors : err}
    //         })
    //     }).catch(err => {
    //         console.log(err);
    //         return {success: false, errors : err}
    //     })


        
        

        

        
    //     return {success: true, filePath : `database-backup-${currentDate}.tar`}

    // } catch (error) {
    //     console.log(error)
    // }
    
    // return {success: true, filePath : `database-backup-${currentDate}.tar`}
    
};

// backup('')

module.exports = {backup};