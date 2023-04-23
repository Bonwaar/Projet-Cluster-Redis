require('dotenv').config()
const path = require('path')
const express = require('express')
const hbs = require('express-handlebars')
const buildRedisClient = require('./service/redisClient')
const fs = require('fs')

const app = express()
const port = process.env.PORT || 3000

const redis = buildRedisClient()

app.use(express.urlencoded({ extended: true }))

/** A rough debugging middleware */
app.use((req, resp, next) => {
  console.log(`${req.method} | URL=${req.url}`)
  return next()
})

/** handlebars template engine */
const VIEWS_PATH = `${__dirname}/views`
app.set('view engine', 'hbs')
app.set('views', VIEWS_PATH)
app.engine(
  'hbs',
  hbs({
    extname: 'hbs',
    defaultView: 'default',
    layoutsDir: `${VIEWS_PATH}/layouts/`,
    partialsDir: `${VIEWS_PATH}/partials/`,
  })
)

app.use(
  '/static', express.static(path.join(__dirname, '/public'))
)

app.get('/', async (request, response) => {
  return response.render('home/index', {
    layout: 'default',
  })
})

app.post('/save-data', async (request, response) => {
  const { key, value } = request.body
  await redis.set(key, value)
  return response.status(201).render('home/index', {
    layout: 'default',
    dataSaved: true,
  })
})

app.post('/save-data-json', async (request, response) => {
  try{
    // Récupérer le contenu du fichier JSON envoyé via la requête POST
    const jsonFile = request.files.jsonFile;
    const jsonData = JSON.parse(jsonFile.data.toString());

    // Insérer les clés et valeurs dans Redis en utilisant le client Redis existant
    console.log('Insertion des données dans Redis...');
    Object.keys(jsonData).forEach((key) => {
      redis.set(key, jsonData[key]);
    });
    console.log('Données insérées dans Redis avec succès !');

    return response.status(201).render('home/index', {
      layout: 'default',
      dataSaved: true,
    });
  }catch (err) {
    console.log(`Impossible de parser le JSON : ${err}`);
    console.error(`Impossible de parser le JSON : ${err}`);
    return null;
  }
  
});
app.post('/save-data-random', async (request, response) => {
  // Générer des données aléatoires
  const numKeys = 10;
  const maxVal = 100;
  const data = {};
  for (let i = 1; i <= numKeys; i++) {
    const key = `key_${i}`;
    const value = Math.floor(Math.random() * maxVal);
    data[key] = value;
  }

  // Insérer les données dans Redis
  try {
    const redisSetPromises = Object.keys(data).map((key) => redis.set(key, data[key]));
    await Promise.all(redisSetPromises);
    return response.status(201).render('home/index', {
      layout: 'default',
      dataSaved: true,
    });
  } catch (err) {
    console.error(`Erreur lors de l'insertion de données dans Redis : ${err}`);
    return response.status(500).render('home/index', {
      layout: 'default',
      dataSaved: false,
    });
  }
});



app.post('/search', async (request, response) => {
  const { key } = request.body
  const value = await redis.get(key)
  return response.status(200).render('home/index', {
    layout: 'default',
    value,
  })
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})