const { stat } = require('fs');
const sql = require("./db.js");
const nodemailer = require('nodemailer');


let schema = "";
function init(schema_name) {
  this.schema = schema_name;
}


function sendEmail(to, subject, body, fromEmail){
    let mailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure : true,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_EMAIL_PWD
        },
        tls:{
            rejectUnauthorized:false
        }
    });
    
    let mailDetails = {
        from: fromEmail,
        to: to,
        subject: subject,
        text: body.replace(/(?:<|(?<=\p{EPres}))[^>\p{EPres}]+(?:>|(?=\p{EPres}))/gu, ""),
        html: body

    };

    mailTransporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log('Error Occurs', err);
        } else {
            console.log('Email sent successfully');
        }
    });
}

async function sendLeadAlertEmail(fromEmailAddress, email){
    let result; 
    try {
        
        let parsed = JSON.parse(process.env.FROM_EMAIL)
        if(parsed.hasOwnProperty(fromEmailAddress)){
            let password = parsed[fromEmailAddress]
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: fromEmailAddress,
                    pass: password
                }
                });
        
                var mailOptions = {
                from: fromEmailAddress,
                to: email.to,
                subject: email.subject,
                text: email.body.replace(/(?:<|(?<=\p{EPres}))[^>\p{EPres}]+(?:>|(?=\p{EPres}))/gu, ""),
                html: email.body,
                };
                console.log('mailOptions *==> ', mailOptions)
                transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                    result = {
                        error : error.message,
                        statusCode : 500
                    }
                    return result;
                } else {
                    console.log('Email sent: ' + info.response);
                    result = {
                        data : info,
                        message : 'Email send successfully'
                    }
                }
                return result;
            })
        }else {
            result = {
                error : 'From email is not configured',
                statusCode : 500
            }
        }
    }catch(error){
        console.log('error in sendEmail method:', error);
        result = {
            error : error.message,
            statusCode : 500
        }
        return result;
    }
}

async function sendEmailWithAttachment(fromEmailAddress, to,cc, subject, body, attachments){
    console.log('cc *==>',cc);
    
    let result; 
    let emailAttachments = [];
    try {
        // console.log('process.env -> ', JSON.parse(process.env.FROM_EMAIL));
        if(attachments && attachments.length > 0){
            let filePathResult = await sql.query(`SELECT * FROM ${this.schema}.file WHERE id IN ( '${attachments.join("' , '")}' )`)
            console.log('filePathResult.rows:', filePathResult.rows);
            if(filePathResult.rowCount > 0){
                for(const eachFile of filePathResult.rows){
                    let tempFilePath;
                    if(eachFile.filepath){
                        tempFilePath = eachFile.filepath
                    }else if(eachFile.parentid && eachFile.title){
                        tempFilePath = process.env.FILE_UPLOAD_PATH + this.schema + "/" + eachFile.parentid + "/" + eachFile.id + "." + eachFile.title.split(".").pop();
                    }
                    if(tempFilePath){
                        let attachmentData = {
                            filename : eachFile.title,
                            path : tempFilePath,
                            cid : Math.random().toString(36).substring(2, 5) + '-' + eachFile.title
                        }
                        emailAttachments.push(attachmentData)
                    }
                }
            }
        }
        let parsed = JSON.parse(process.env.FROM_EMAIL)
        console.log('parsed *==>',parsed);
        let foundConfig = parsed.find(config => config.email === fromEmailAddress);
        console.log('foundConfig *==>',foundConfig);

        // if(parsed.hasOwnProperty(fromEmailAddress)){
            if (foundConfig) {
            console.log('inside if');
            // let password = parsed[fromEmailAddress]
            let password = foundConfig.password;
            console.log('password:', password);
            var transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secureConnection: false,
                auth: {
                    user: fromEmailAddress,
                    pass: password
                },
                tls: {
                    ciphers:'SSLv3'
                }
            });
                
        console.log('transporter *==>',transporter);
        
                var mailOptions = {
                from: fromEmailAddress,
                to: to,
                cc:cc,
                subject: subject,
                text: body.replace(/(?:<|(?<=\p{EPres}))[^>\p{EPres}]+(?:>|(?=\p{EPres}))/gu, ""),
                html: body,
                };
                if(emailAttachments.length > 0){
                    mailOptions.attachments = emailAttachments
                }
                console.log('mailOptions -> ', mailOptions)
                transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                    result = {
                        error : error.message,
                        statusCode : 500
                    }
                    return result;
                } else {
                    console.log('Email sent: ' + info.response);
                    result = {
                        data : info,
                        message : 'Email send successfully'
                    }
                }
                return result;
            })
        }else {
            result = {
                error : 'From email is not configured',
                statusCode : 500
            }
        }
    }catch(error){
        console.log('error in sendEmail method:', error);
        result = {
            error : error.message,
            statusCode : 500
        }
        return result;
    }
}


module.exports = {sendEmail, sendEmailWithAttachment, init, sendLeadAlertEmail};