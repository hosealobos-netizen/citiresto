# CiTiResto

A restaurant hub for the **dbRestaurants** database. Built with HTML, CSS and JavaScript on the front end, and Node.js, Express and Mongoose on the back end, synced to **MongoDB Atlas**.

## What it does

| Requirement | Where |
| --- | --- |
| Home section | `#home` (hero, featured spots, borough tiles) |
| About section | `#about` |
| List of restaurants | `#list` (paginated table) |
| Search by name field | Search box, "Search by name" |
| Search by cuisine field | Search box, "Search by cuisine" |
| Filter / group by borough | Borough chips and the borough tiles on the home page |
| Best quality restaurants | `#best` (aggregated score greater than 90) |
| Add, Edit and Delete | "Add a spot" button, and Edit / Delete on every row |
| Synced to Atlas | Every change is saved to your Atlas cluster through Mongoose |

## 1. Install

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
```

## 2. Set up MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com.
2. **Database Access**: create a database user (username and password).
3. **Network Access**: add your IP address (or `0.0.0.0/0` while you are testing).
4. **Connect > Drivers**: copy the connection string.
5. Copy `.env.example` to a new file named `.env` and fill it in:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
DB_NAME=dbRestaurants
COLLECTION=restaurants
PORT=3000
```

If your password has special characters (such as `@` or `#`), URL-encode them.

## 3. Add data

Pick one:

- **Use the sample data** (30 restaurants): `npm run seed`
- **Use your class dataset**: import it into the `dbRestaurants` database. If your collection has a different name than `restaurants`, set `COLLECTION` in `.env`. The app expects documents shaped like this:

```json
{
  "name": "Morris Park Bake Shop",
  "borough": "Bronx",
  "cuisine": "Bakery",
  "address": { "building": "1007", "street": "Morris Park Ave", "zipcode": "10462" },
  "grades": [{ "date": "2014-03-03T00:00:00Z", "grade": "A", "score": 2 }]
}
```

`npm run seed -- --force` wipes the collection first, then seeds.

## 4. Run it

```bash
npm start        # or: npm run dev   (restarts when you save a file)
```

Open http://localhost:3000.

## Project structure

```
citiresto/
  server.js              Express app + Atlas connection
  seed.js                Sample data loader
  models/Restaurant.js   Mongoose schema
  routes/restaurants.js  REST API (list, search, filter, best, add, edit, delete)
  public/
    index.html           All page sections and dialogs
    css/style.css        Styles (responsive)
    js/app.js            Front-end logic
    img/favicon.svg
```

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/restaurants?q=&field=name\|cuisine&borough=&page=&limit=` | List, search and filter |
| GET | `/api/restaurants/featured` | Four random picks for the home page |
| GET | `/api/restaurants/best?min=90` | Aggregated score greater than `min`, highest first |
| GET | `/api/restaurants/stats` | Totals for the home and about sections |
| GET | `/api/restaurants/:id` | One restaurant |
| POST | `/api/restaurants` | Add |
| PUT | `/api/restaurants/:id` | Edit |
| DELETE | `/api/restaurants/:id` | Delete |

## Troubleshooting

- **"Missing MONGODB_URI"**: you have not created `.env` yet.
- **"Could not connect to MongoDB Atlas"**: check the username and password, and that your IP is allowed under Network Access.
- **The list says it could not load**: the server is not running, or `.env` points at an empty database. Run `npm run seed`.
- **Fonts look plain**: the Fraunces and DM Sans fonts load from Google Fonts, so you need an internet connection.
