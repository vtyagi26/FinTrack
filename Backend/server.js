import app from './api/app.js';
import * as dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
