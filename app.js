const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    console.log(database);
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (Player) => {
  return {
    movieId: Player.movie_id,
    directorId: Player.director_id,
    movieName: Player.movie_name,
    leadActor: Player.lead_actor,
  };
};

const oneMovieItem = (eachPlayer) => {
  return {
    movieName: eachPlayer.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      movie;`;
  const playersArray = await database.all(getPlayersQuery);
  response.send(playersArray.map((eachPlayer) => oneMovieItem(eachPlayer)));
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  let AddToTheMovie = `
    INSERT INTO
    movie (director_id,movie_name,lead_actor)
    VALUES
     ('${directorId}', '${movieName}', '${leadActor}');`;

  let addToMovie = await database.run(AddToTheMovie);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let oneMovieId = `
    SELECT * FROM 
    movie
    WHERE
    movie_id='${movieId}';`;
  const oneMovie = await database.get(oneMovieId);
  response.send(oneMovie);
});

app.put("/movies/:movieId/", async (request, response) => {
  let { directorId, movieName, leadActor } = request.body;
  let { movieId } = request.params;
  let updateMovie = `
   UPDATE
   movie
    SET
    movie_name='${movieName}',
    director_id='${directorId}',
    lead_actor='${leadActor}'
        WHERE
      movie_id = ${movieId};
    ;`;
  const oneMovie = await database.get(updateMovie);
  response.send("Movie Details Updated");
});
app.delete("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let deleteMovie = `
    DELETE FROM movie
    WHERE
    movie_id='${movieId}';`;
  let DeleteMovie = await database.run(deleteMovie);
  response.send("Movie Removed");
});
app.get("/directors/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      director;`;
  const directorsOf = await database.all(getPlayersQuery);
  response.send(directorsOf);
});

module.exports = app;
