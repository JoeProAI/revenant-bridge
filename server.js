const express = require('express');
const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.send('OK'));
app.get('/test-flow', (req, res) => res.send('OK'));

console.log('Server starting...');

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log('Server listening on port ' + port);
});