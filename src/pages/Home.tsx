import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";

const API = import.meta.env.VITE_API_URL;
const KEY = import.meta.env.VITE_TMDB_KEY;

type Movie = {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
};
type MoviesResponse = { results: Movie[]; total_pages: number };

export default function Home() {
  // Search state lives in the URL so the Back button from a detail page restores results.
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const year = params.get("year") ?? "";
  const page = Number(params.get("page") ?? 1);

  // Controlled inputs
  const [input, setInput] = useState(q);
  const [yearInput, setYearInput] = useState(year);

  const [history, setHistory] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem("history") || "[]")
  );

  // API parameters come from user input; no search term shows popular movies.
  const url = q
    ? `${API}/search/movie?api_key=${KEY}&query=${encodeURIComponent(q)}&page=${page}${
        year ? `&year=${year}` : ""
      }`
    : `${API}/movie/popular?api_key=${KEY}&page=${page}`;
  const { data, loading, error } = useFetch<MoviesResponse>(url);

  const search = (term: string, y: string) => {
    setParams(term ? { q: term, year: y, page: "1" } : { page: "1" });
    if (!term) return;
    const next = [term, ...history.filter((h) => h !== term)].slice(0, 5);
    setHistory(next);
    localStorage.setItem("history", JSON.stringify(next));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search(input.trim(), yearInput.trim());
  };

  const goTo = (p: number) => {
    const next = new URLSearchParams(params);
    next.set("page", String(p));
    setParams(next);
  };
  const totalPages = Math.min(data?.total_pages ?? 0, 500);

  return (
    <>
      <form onSubmit={handleSubmit} className="form">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search movies (e.g. batman)"
        />
        <input
          type="number"
          value={yearInput}
          onChange={(e) => setYearInput(e.target.value)}
          placeholder="Year"
          min="1870"
          max="2100"
        />
        <button type="submit">Search</button>
      </form>

      {history.length > 0 && (
        <p className="history">
          Recent:{" "}
          {history.map((h) => (
            <button
              key={h}
              className="chip"
              onClick={() => {
                setInput(h);
                search(h, yearInput.trim());
              }}
            >
              {h}
            </button>
          ))}
        </p>
      )}

      {!q && <h2>Popular movies</h2>}
      {loading && <p>Loading...</p>}
      {error && <p className="error">Error: {error}</p>}
      {!loading && data && data.results.length === 0 && <p>No movies found.</p>}

      <div className="grid">
        {data?.results.map((m) => (
          <Link key={m.id} to={`/movie/${m.id}`} className="card">
            {m.poster_path ? (
              <img src={`https://image.tmdb.org/t/p/w342${m.poster_path}`} alt={m.title} />
            ) : (
              <div className="noposter">No poster</div>
            )}
            <strong>{m.title}</strong>
            <span>
              {m.release_date?.slice(0, 4) || "—"} · ⭐ {m.vote_average.toFixed(1)}
            </span>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pager">
          <button disabled={page <= 1} onClick={() => goTo(page - 1)}>
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => goTo(page + 1)}>
            Next
          </button>
        </div>
      )}
    </>
  );
}
