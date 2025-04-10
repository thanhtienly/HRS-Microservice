require("dotenv").config();
const nodemailer = require("nodemailer");

const sendVerifyAccountEmail = async (
  data = { email: "", firstName: "", lastName: "", verifyURL: "" }
) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASSWORD,
    },
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
  });

  let response = await transporter.sendMail({
    from: `HCMUT_RESERVATION_SERVICE <${process.env.NODEMAILER_USER}>`,
    to: data.email,
    subject: `Verify account at HCMUT_Reservation_System`,
    text: `Hi ${data.firstName} ${data.lastName}, you've registered an account with this email at HCMUT_Reservation_System.
If this action performed by yourself, click on the link below to verify the account before using it
${data.verifyURL}

HCMUT Study Space Management Team
    `,
  });

  return response;
};

const sendJoinRoomInvitationEmail = async (
  data = {
    email: "",
    invitationURL: "",
    roomName: "",
    roomType: "",
    date: "",
    startTime: "",
    endTime: "",
    inviterName: "",
  }
) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASSWORD,
    },
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
  });

  let response = await transporter.sendMail({
    from: `HCMUT_RESERVATION_SERVICE <${process.env.NODEMAILER_USER}>`,
    to: data.email,
    subject: `Invitation to join study room at HCMUT`,
    text: `You've received an invitation to join study room at HCMUT from ${data.inviterName}, with information below
Room: ${data.roomName}
Room Type: ${data.roomType}
Date: ${data.date}
From: ${data.startTime}
To: ${data.endTime}

Visit the link below to accept the invitation
${data.invitationURL}
HCMUT Study Space Management Team
    `,
  });

  return response;
};

module.exports = { sendVerifyAccountEmail, sendJoinRoomInvitationEmail };
