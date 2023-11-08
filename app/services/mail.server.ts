import nodemailer from "nodemailer";
import * as postmark from "postmark";

interface Mail {
  to: string;
  from?: string;
  subject: string;
  htmlBody: string;
}

export async function sendMail(mail: Mail) {
  var client = new postmark.ServerClient(
    process.env.POSTMARK_API_KEY as string
  );

  const response = await client.sendEmail({
    To: mail.to,
    From: process.env.POSTMARK_FROM_MAIL as string,
    Subject: mail.subject,
    HtmlBody: mail.htmlBody,
    MessageStream: "outbound",
  });
  return response.ErrorCode === 0;
}

export async function mailNodemailer(mail: Mail) {
  ("use strict");

  // Generate SMTP service account from ethereal.email
  nodemailer.createTestAccount((err, account) => {
    if (err) {
      console.error("Failed to create a testing account");
      console.error(err);
      return process.exit(1);
    }

    console.log("Credentials obtained, sending message...");

    // NB! Store the account object values somewhere if you want
    // to re-use the same account for future mail deliveries

    const transporter = nodemailer.createTransport({
      port: 587,
      secure: false,
      requireTLS: true,
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_API_KEY,
      },
      logger: true,
    });
    // Message object
    let message = {
      // Comma separated list of recipients
      to: `Nodemailer <${mail.to}>`,

      // Subject of the message
      subject: "Nodemailer is unicode friendly ✔" + Date.now(),

      // plaintext body
      text: "Hello to myself!",

      // HTML body
      html: `<p><b>Hello</b> to myself <img src="cid:note@example.com"/></p>
        <p>Here's a nyan cat for you as an embedded attachment`,
    };

    transporter.sendMail(message, (error, info) => {
      if (error) {
        console.log("Error occurred");
        console.log(error.message);
        return false;
      }

      console.log("Message sent successfully!");
      console.log(nodemailer.getTestMessageUrl(info));

      // only needed when using pooled connections
      transporter.close();
    });
  });
}
