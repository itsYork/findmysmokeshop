const express = require('express');
const path = require('path');

const app = express();
const FSQ_API_KEY = process.env.FSQ_API_KEY || '';

app.get('/api/config', (req, res) => {
  res.json({ fsqApiKey: FSQ_API_KEY });
});

app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
