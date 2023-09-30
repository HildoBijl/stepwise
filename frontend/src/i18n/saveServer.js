import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'

const app = express()
console.log('Starting server...')

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/locales/add/:lng/:ns', (req, res) => {
  const { lng, ns } = req.params;

  console.log(req.body);
  console.log(lng, ns);

  res.sendStatus(200);
})

app.listen(8000, () =>
  console.log(`Listening!`),
)
