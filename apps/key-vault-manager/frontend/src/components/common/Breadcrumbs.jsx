// src/components/common/Breadcrumbs.jsx

import { Link, useMatches } from "react-router";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const matches = useMatches();

  const crumbs = matches
    .filter((match) => Boolean(match.handle?.crumb))
    .map((match) => {
      const crumbValue = match.handle.crumb;
      return {
        id: match.id,
        pathname: match.pathname,
        label:
          typeof crumbValue === "function"
            ? crumbValue(match.data)
            : crumbValue,
      };
    });

  if (crumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs-nav">
      <Link to="/" className="breadcrumbs-home-link">
        <Home className="breadcrumbs-home-icon" />
        <span>HOME</span>
      </Link>

      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <div key={crumb.id} className="breadcrumbs-item">
            <ChevronRight className="breadcrumbs-separator" />
            {isLast ? (
              <span className="breadcrumbs-active-crumb" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link to={crumb.pathname} className="breadcrumbs-link">
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
