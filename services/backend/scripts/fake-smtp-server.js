const { SMTPServer } = require('smtp-server');

const port = Number(process.env.FAKE_SMTP_PORT || 2525);

const server = new SMTPServer({
  disabledCommands: ['AUTH', 'STARTTLS'],
  authOptional: true,
  onData(stream, session, callback) {
    let raw = '';

    stream.on('data', (chunk) => {
      raw += chunk.toString();
    });

    stream.on('end', () => {
      console.log('--- Fake SMTP Message Start ---');
      console.log(`From: ${session.envelope.mailFrom.address}`);
      console.log(`To: ${session.envelope.rcptTo.map((r) => r.address).join(', ')}`);
      console.log(raw);
      console.log('--- Fake SMTP Message End ---');
      callback();
    });
  },
});

server.on('error', (err) => {
  console.error('Fake SMTP server error:', err.message);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Fake SMTP server listening on 127.0.0.1:${port}`);
});
