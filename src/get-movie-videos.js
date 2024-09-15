const accessToken = process.env.TVDB_ACCESS_TOKEN ?? null;

if (!accessToken) {
  console.error(
    "You need to specify a TVDB access token. Run\n$ echo TVDB_ACCESS_TOKEN={YOUR_TOKEN_HERE} > .env.local"
  );
}

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
};

export async function getMovieVideos(movieID) {
  const url = `https://api.themoviedb.org/3/movie/${movieID}/videos?language=en-US`;
  const response = await fetch(url, options)
    .then((res) => res.json())
    .catch((err) => console.error("error:" + err));

  if (response?.results) {
    return response?.results;
  } else {
    console.error(JSON.stringify(response));
    throw new Error(`Videos for ${movieID} not found!`);
  }
}
