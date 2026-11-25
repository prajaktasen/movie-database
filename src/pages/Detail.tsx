import { useNavigate, useParams } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";

const API = import.meta.env.VITE_API_URL;
const KEY = import.meta.env.VITE_TMDB_KEY;

type MovieDetail = {
  title: string;
  release_date: string;
  tagline: string;
  runtime: number | null;
  vote_average: number;
  genres: { id: number; name: string }[];
  overview: string;
  poster_path: string | null;
  credits: {
    cast: { id: number; name: string }[];
    crew: { id: number; name: string; job: string }[];
  };
};

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useFetch<MovieDetail>(
    `${API}/movie/${id}?api_key=${KEY}&append_to_response=credits`
  );

  const director = data?.credits.crew.find((c) => c.job === "Director");

  return (
    <>
      <button className="back" onClick={() => navigate(-1)}>← Back</button>
      {loading && <p>Loading...</p>}
      {error && <p className="error">Error: {error}</p>}
      {data && (
        <div className="detail">
          {data.poster_path && (
            <img src={`https://image.tmdb.org/t/p/w500${data.poster_path}`} alt={data.title} />
          )}
          <div>
            <h2>
              {data.title} {data.release_date && `(${data.release_date.slice(0, 4)})`}
            </h2>
            {data.tagline && <p><em>{data.tagline}</em></p>}
            <p>
              {data.runtime ? `${data.runtime} min · ` : ""}⭐ {data.vote_average.toFixed(1)}
            </p>
            <p>Genres: {data.genres.map((g) => g.name).join(", ")}</p>
            {director && <p>Director: {director.name}</p>}
            <p>Cast: {data.credits.cast.slice(0, 8).map((c) => c.name).join(", ")}</p>
            <p>{data.overview}</p>
          </div>
        </div>
      )}
    </>
  );
}
