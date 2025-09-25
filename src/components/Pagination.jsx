import React from "react";

export default function Pagination({ page, totalPages, onPage }) {
  return (
    <div className="pagination">
      <button disabled={page<=1} onClick={() => onPage(page-1)}>Prev</button>
      <div>Page {page} / {totalPages}</div>
      <button disabled={page>=totalPages} onClick={() => onPage(page+1)}>Next</button>
    </div>
  );
}
