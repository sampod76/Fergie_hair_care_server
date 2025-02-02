/* eslint-disable no-irregular-whitespace */
import nodemailer from 'nodemailer';
import config from '../config';

export type IMailData = {
  company_name?: string;
  title: string;
  senderEmail?: string;
  receiver_email?: string;
  receivers_email?: string;
  subject: string;
  logo?: string;
  logo_to_link?: string;
  button?: {
    button_action_details: string;
    button_text: string;
    button_link: string;
    button_color_code: string;
  };
  dictionary?: {
    date: string;
    address: string;
  };
  body_text: string;
  footer_text?: string;
  data?: {
    otp: string | number;
    reset_link?: string;
    time_out: string | Date;
  };
};
export const sendMailHelper = async (bodyData: IMailData) => {
  const {
    company_name,
    title,
    senderEmail,
    receiver_email,
    receivers_email,
    subject,
    logo,
    logo_to_link,
    // copyright,
    button,
    dictionary,
    body_text,
    footer_text,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data,
  } = bodyData;

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: config.nodemailer.auth_user as string,
      pass: config.nodemailer.auth_pass as string,
    },
    /* 
    host: config.aws.ses.host,
    port: config.env === 'production' ? 465 : 587,
    secure: config.env === 'production' ? true : false,
     */

    /* //aws --> ses
    host: config.aws.ses.host,
    port: 587,
    secure: false,
    auth: {
      user: config.aws.ses.smptUserName as string,
      pass: config.aws.ses.smptPassword as string,
    }, 
    */

    tls: {
      rejectUnauthorized: false,
    },
  });

  // to: data.receiver_Email,//single email
  /* multipal email to sand same email because this fild accept . to:'sampodnath@gmail.com,sampodnath76@gmail.com' 
    to: data.receivers_Email.toString(),
    */
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
          color: #333;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .email-header {
          text-align: center;
          padding-bottom: 2px;
        }
        .email-title {
          font-size: 24px;
          color: #333;
        }
        .email-body {
          font-size: 16px;
          line-height: 1.5;
          color: #555;
          margin-bottom: 20px;
        }
        .email-action {
          text-align: center;
          margin: 20px 0;
        }
        .email-button {
          display: inline-block;
          padding: 10px 20px;
          font-size: 16px;
          color: #ffffff;
          background-color: ${button?.button_color_code || '#22BC66'};
          text-decoration: none;
          border-radius: 5px;
        }
        .email-footer {
          text-align: center;
          font-size: 14px;
          color: #777;
          margin-top: 20px;
        }
        .email-footer a {
          color: #22BC66;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
       
        <div class="email-header">
          <h1 class="email-title">${process.env.PROJECT_NAME}</h1>
          <h1 class="email-title">${title || ''}</h1>
        </div>
  
     
        <div class="email-body">
          <p>${body_text}</p>
          ${
            dictionary
              ? `<p><strong>Date:</strong> ${dictionary.date}</p>
                 <p><strong>Address:</strong> ${dictionary.address}</p>`
              : ''
          }
        </div>
  
       
        ${
          button?.button_text
            ? `<div class="email-action">
              <p>${button.button_action_details || 'Please click the button below:'}</p>
              <a href="${button.button_link}" class="email-button">${button.button_text}</a>
            </div>`
            : ''
        }
  
      
        <div class="email-footer">
          <p>${footer_text || 'Need help or have questions? Just reply to this email.'}</p>
        </div>
      </div>
    </body>
    </html>
    `;

  const returNTransport = await transporter.sendMail({
    // from: 'docudrivematt@gmail.com', //free google then use
    from: senderEmail || config.nodemailer.default_sender_email, //'mail@appdocudrive.com', //any email but last -> @yourdomain
    subject: subject,
    to: receiver_email || receivers_email?.toString(),
    html: htmlContent,
  });

  return returNTransport;
};
