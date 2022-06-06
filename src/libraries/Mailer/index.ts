import _ from "lodash";
import nodemailer,{SendMailOptions} from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
 
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
 

const NODEMAILER_ERRORS = {
    EAUTH : {
        name : "UNAUTHORIZED_CLIENT",
        message : "",
        code : "EAUTH"
    },
    EENVELOPE : {
        name : "",
        message : "missing email receiver",
        code : "EENVELOPE"
    }
}

const transporter = nodemailer.createTransport({
    service : "gmail",
    host : "smtp.gmail.com",
    port : 587,
    auth : {
        type: "OAuth2",
        user: process.env.EMAIL_SENDER, 
        clientId : process.env.GMAIL_CLIENT_ID,
        clientSecret : process.env.GMAIL_CLIENT_SECRET,
        refreshToken : "1//04CsJUcU0e5LtCgYIARAAGAQSNwF-L9IrcltaSzJ78bMdgC5YfMBE7IwJhivF1b3dbYF5QsCFWglaDlFhoF4O7A7h3ADf16xwq2o",
        accessToken : "ya29.a0ARrdaM8xTMorg9TnREmW7MtAs-Nng1gF8yCrvP0GfjTz8IieCsNqA3_dBEIK0haNwEGJJeuex6F6tLIHsT33ua3KBN_wXGOrxaWZXvtgSR0mEzTVlkS7QyRrbwYoqzvMzzL7wduHoNpSuJgFZ-4P3uCVFJc_"
    }
})

 
export class SendEmail{
   private mailOptions : SendMailOptions = {}
   
   From(from : string){ 
      this.mailOptions.from = from;
      return this
   }

   to(to : string | Array<string>){    
      this.mailOptions.to = _.castArray(to).join(','); 
      return this;
   }

   setSubject(subject : string){
       this.mailOptions.subject = subject;
       return this;
   }

   setText(text : string){
       this.mailOptions.text = text;
       return this;
   }

   setHtml(html : string){
       this.mailOptions.html = html;
       return this;
   }

   setCc(cc : string){
        this.mailOptions.cc = cc;
        return this;
   }

   setBcc(Bcc : string){
        this.mailOptions.cc = Bcc;
        return this;
   }

   async send() : Promise<SMTPTransport.SentMessageInfo>{
    
  
    
        try{   
            const result = await transporter.sendMail(this.mailOptions);
            return Promise.resolve(result);
        }catch(err){  
            return _.get(NODEMAILER_ERRORS,err.code,err)
        }
   }
} 


