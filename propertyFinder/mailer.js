const nodemailer = require('nodemailer');
const { subjectStrings, emailBody } = require('./emailContent');
const { senderEMail, senderSecret, recipients } = require('./vars');


async function sendEmail(property) {
  // Create a transporter using your email service credentials
  const transporter = nodemailer.createTransport({
    service: 'zoho', 
    auth: {
      user: senderEMail,
      pass: senderSecret,
    },
  });

  const randomSubject = Math.floor(Math.random() * subjectStrings.length);
  const emailSubject = subjectStrings[randomSubject];
  const randomBody = Math.floor(Math.random() * emailBody.length);
  const body = emailBody[randomBody];

  // Set up the email details
  const mailOptions = {
    from: sendEmail, 
    to: recipients, 
    subject: emailSubject,
    html: `
      <h1>New Property Listing</h1>
      <p>Link: ${property.link}</p>
      <p>Title: ${property.title}</p>
      <p>Description: ${property.description}</p>
      <p>Price: ${property.price}</p>
      <p>${body}</p>
    `,
  };

  // Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
  const ranNum = Math.floor(Math.random() * 400000);
  await new Promise((resolve) => setTimeout(resolve, ranNum));
}

module.exports = { sendEmail };

