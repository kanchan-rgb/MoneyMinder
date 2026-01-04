const { google } = require("googleapis");

/**
 * Reads recent transaction-related emails from Gmail (INBOX ONLY)
 * @param {OAuth2Client} auth
 * @returns {Promise<Array>}
 */
async function readEmails(auth) {
  const gmail = google.gmail({ version: "v1", auth });

  // 🔒 STRICT SEARCH: INBOX ONLY (NO TRASH / SPAM)
  const listRes = await gmail.users.messages.list({
    userId: "me",
    q: 'in:inbox (credit OR debit OR credited OR debited OR transaction)',
    maxResults: 10,
  });

  const messages = listRes.data.messages || [];
  const emails = [];

  for (const msg of messages) {
    const message = await gmail.users.messages.get({
      userId: "me",
      id: msg.id,
      format: "full",
    });

    const headers = message.data.payload.headers || [];

    const subject =
      headers.find(h => h.name.toLowerCase() === "subject")?.value || "";

    const from =
      headers.find(h => h.name.toLowerCase() === "from")?.value || "";

    const date =
      headers.find(h => h.name.toLowerCase() === "date")?.value || "";

    // 🧠 Recursive body extractor
    const extractText = payload => {
      if (!payload) return "";

      if (payload.body?.data) {
        return Buffer.from(payload.body.data, "base64")
          .toString("utf-8")
          .replace(/\s+/g, " ");
      }

      if (payload.parts) {
        return payload.parts.map(extractText).join(" ");
      }

      return "";
    };

    const bodyText = extractText(message.data.payload);

    // 🛑 Ignore empty mails
    if (!bodyText.trim()) continue;

    emails.push({
      id: msg.id,
      subject,
      from,
      date,
      text: bodyText,
    });
  }

  return emails;
}

module.exports = {
  readEmails,
};
