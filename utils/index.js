require("dotenv").config();
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");

const OAUTH_PLAYGROUND = "https://developers.google.com/oauthplayground";
const CLIENT_ID = process.env.MAIL_CLIENT_ID || "your_client_id";
const CLIENT_SECRET = process.env.MAIL_CLIENT_SECRET || "your_client_secret";
const REFRESH_TOKEN = process.env.MAIL_REFRESH_TOKEN || "your_refresh_token";
const SENDER_MAIL = process.env.SENDER_EMAIL_ADDRESS || "your_sender_email";

// Send mail function
const sendEmail = async (to, txt) => {
  try {
    const oAuth2Client = new OAuth2Client(
      CLIENT_ID,
      CLIENT_SECRET,
      OAUTH_PLAYGROUND
    );

    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

    const access_Token = (await oAuth2Client.getAccessToken()).token;

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: SENDER_MAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: access_Token, // Corrected field name
      },
    });

    const mailOptions = {
      from: SENDER_MAIL,
      to: to,
      subject: "Verification Email",
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your recent app status</title>
      </head>
      <body>
          <div style="max-width: 700px; margin: auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 16px; line-height: 1.6; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color: #333;">
              <h2 style="text-align: center; text-transform: uppercase; color: teal;">${txt}</h2>
             
          </div>
      </body>
      </html>
      `,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (err) {
    console.error(
      "Error occurred while sending email: ",
      err.response ? err.response.data : err.message
    );
    console.error(err);
  }
};

module.exports = { sendEmail };
