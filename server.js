const express = require('express');
const app = express();

app.use(express.static('ui'));

app.get('/health', (req, res) => res.status(200).send('OK'));
app.get('/test-flow', (req, res) => res.status(200).send('OK'));

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on port ' + port);
});