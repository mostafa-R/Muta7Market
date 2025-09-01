import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * @param {number} currentPage
 * @param {number} totalPages
 * @param {function} onPageChange
 * @param {number} showPages
 * @param {boolean} showInfo
 * @param {number} totalItems
 * @param {number} itemsPerPage
 * @param {boolean} loading
 * @param {string} className
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showPages = 5,
  showInfo = false,
  totalItems = 0,
  itemsPerPage = 0,
  loading = false,
  className = "",
}) => {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== currentPage) {
      onPageChange(pageNumber);
    }
  };

  const getVisiblePages = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageClick(1)}
          className="px-3 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span
            key="dots1"
            className="px-3 py-2 text-sm text-[hsl(var(--muted-foreground))]"
          >
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          disabled={loading}
          aria-current={i === currentPage ? "page" : undefined}
          aria-label={`${t("common.page")} ${i}${
            i === currentPage ? ` (${t("common.currentSection")})` : ""
          }`}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            i === currentPage
              ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
              : "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span
            key="dots2"
            className="px-3 py-2 text-sm text-[hsl(var(--muted-foreground))]"
          >
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageClick(totalPages)}
          className="px-3 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div
      className={`flex flex-col items-center gap-4 ${className}`}
      role="navigation"
      aria-label="Pagination"
    >
      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1 || loading}
          className="flex items-center px-4 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--muted))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label={t("common.previous")}
        >
          {loading && currentPage > 1 ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : null}
          <span className="hidden sm:inline ml-1">{t("common.previous")}</span>
        </button>

        {/* Page Numbers */}
        <div className="flex gap-1" role="group" aria-label="Page numbers">
          {getVisiblePages()}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || loading}
          className="flex items-center px-4 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--muted))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label={t("common.next")}
        >
          <span className="hidden sm:inline mr-1">{t("common.next")}</span>
          {loading && currentPage < totalPages ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : null}
        </button>
      </div>

      {/* Page Info */}
      {showInfo && totalItems > 0 && itemsPerPage > 0 && (
        <div className="text-center">
          <p
            className="text-sm text-[hsl(var(--muted-foreground))]"
            aria-live="polite"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("common.loading")}
              </span>
            ) : (
              t("players.showingResults", {
                filtered: Math.min(
                  itemsPerPage,
                  totalItems - (currentPage - 1) * itemsPerPage
                ),
                total: totalItems,
              })
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default Pagination;
