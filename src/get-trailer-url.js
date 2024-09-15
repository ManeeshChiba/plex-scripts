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

export async function getMovieID(searchTerm) {
  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
    searchTerm
  )}&include_adult=false&language=en-US&page=1`;
  const response = await fetch(url, options)
    .then((res) => res.json())
    .catch((err) => console.error("error:" + err));

  if (response?.results[0]?.id) {
    return response?.results[0]?.id;
  } else {
    console.error(JSON.stringify(response));
    throw new Error(`ID for ${searchTerm} not found!`);
  }
}
