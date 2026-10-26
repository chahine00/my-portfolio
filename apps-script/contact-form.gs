// Google Apps Script that receives the portfolio's contact form and emails it.
// It runs inside the skewnest21@gmail.com Google account, so the email is sent from that Gmail
// address. No password is needed: Google runs it as the account that deployed it.
//
// This file is only a copy for reference; the live version lives at script.google.com.
// To change it: edit it there, then Deploy → Manage deployments → Edit → Version: New version.

const TO = 'leb_ach@hotmail.com'

// Called when the website sends the form (an HTTP POST to the web app's URL).
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents)

    // A hidden field that people never see. Bots fill in every field, so if it has a value,
    // pretend it worked and send nothing.
    if (data._honey) return json({ success: true })

    const name = String(data.name || '').trim().slice(0, 200)
    const email = String(data.email || '').trim().slice(0, 200)
    const message = String(data.message || '').trim().slice(0, 5000)

    if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ success: false, message: 'Please fill in your name, a valid email and a message.' })
    }

    MailApp.sendEmail({
      to: TO,
      replyTo: email, // pressing "Reply" answers the visitor directly
      name: 'Portfolio contact form',
      subject: 'Portfolio message from ' + name,
      body: 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message,
    })

    return json({ success: true })
  } catch (err) {
    return json({ success: false, message: 'The message could not be sent.' })
  }
}

// Run this once from the editor to give the script permission to send email.
function authorize() {
  MailApp.getRemainingDailyQuota()
}

function json(object) {
  return ContentService.createTextOutput(JSON.stringify(object)).setMimeType(ContentService.MimeType.JSON)
}
