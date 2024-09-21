require('dotenv').config();

const User = require('../models/user');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

exports.register = async (req, res) => {
    const { login, password, confirmPassword, email } = req.body;

    if (password !== confirmPassword) {
        return res.redirect('/message?type=error&message=Passwords%20do%20not%20match!');
    }

    try {
        const userExists = await User.findByLogin(login) || await User.findByEmail(email);
        if (userExists) {
            return res.redirect('/message?type=error&message=User%20with%20this%20login%20or%20email%20already%20exists!');
        }

        const newUser = new User({ login, password, email });
        await newUser.save();
        res.redirect('/message?type=success&message=User%20successfully%20registered!');
    } catch (error) {
        console.log(error);
        res.redirect('/message?type=error&message=An%20error%20occurred.%20Please%20try%20again.');
    }
};

exports.login = async (req, res) => {
    const { login, password } = req.body;

    try {
        const user = await User.findByLogin(login);
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = {
                login: user.login,
                id: user.id
            };
            res.redirect('/');
        } else {
            res.redirect('/message?type=error&message=Invalid%20login%20or%20password!');
        }
    } catch (error) {
        console.log(error);
        res.redirect('/message?type=error&message=An%20error%20occurred.%20Please%20try%20again.');
    }
};

exports.logout = async (req, res) => {
req.session.destroy(err => {
    if (err) {
      console.log(err);
      res.redirect('/message?type=error&message=An%20error%20occurred.%20Please%20try%20again.');
    } else {
      res.redirect('/');
    }
  });
}

exports.passwordReminder = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findByEmail(email);
        if (!user) {
            return res.redirect('/message?type=error&message=We%20have%20no%20account%20with%20that%20email.');
        }

        let testAccount = await nodemailer.createTestAccount();

        let transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            }
        });

        const mailOptions = {
            from: '"S.W.O.R.D. Reminder" <no-reply@sword.com>',
            to: user.email,
            subject: 'Password Reminder',
            text: `Hello ${user.login}, your password is: ${user.password}` //need to send reset password token
        };

        let info = await transporter.sendMail(mailOptions);

        const previewUrl = nodemailer.getTestMessageUrl(info);

        res.redirect(`/message?type=success&message=Password%20reminder%20sent!&previewUrl=${encodeURIComponent(previewUrl)}`);
    } catch (error) {
        console.error('Error sending password reminder:', error);
        res.redirect('/message?type=error&message=An%20error%20occurred.%20Please%20try%20again.');
    }
}