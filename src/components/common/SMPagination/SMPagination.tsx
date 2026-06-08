"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../SMButton/SMButton";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  // 5 ?>:07K205< ?038=0F8N 5A;8 2A53> 1 AB@0=8F0
  if (totalPages <= 1) return null;

  // 5=5@8@C5< <0AA82 =><5@>2 AB@0=8F 4;O >B>1@065=8O
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // 0:A8<C< 2848<KE :=>?>: AB@0=8F

    if (totalPages <= maxVisible) {
      // A;8 AB@0=8F <0;>, ?>:07K205< 2A5
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // A5340 ?>:07K205< ?5@2CN AB@0=8FC
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // >:07K205< AB@0=8FK 2>:@C3 B5:CI59
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // A5340 ?>:07K205< ?>A;54=NN AB@0=8FC
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* =>?:0 "0704" */}
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="outline"
        className="h-10 w-10 p-0 border-gray-300 hover:bg-gray-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed hidden sm:flex items-center justify-center"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      {/* >18;L=0O 25@A8O - B>;L:> B5:CI0O AB@0=8F0 */}
      <div className="flex sm:hidden items-center gap-2">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
          className="h-10 px-3 border-gray-300 hover:bg-gray-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <span className="text-sm text-gray-700 min-w-[80px] text-center">
          {currentPage} / {totalPages}
        </span>

        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="outline"
          className="h-10 px-3 border-gray-300 hover:bg-gray-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* 5A:B>?=0O 25@A8O - 2A5 =><5@0 AB@0=8F */}
      <div className="hidden sm:flex items-center gap-2">
        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-gray-500"
              >
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <Button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              variant={isActive ? "default" : "outline"}
              className={`h-10 w-10 p-0 cursor-pointer ${
                isActive
                  ? "bg-[#18A36C] hover:bg-[#18A36C]/90 text-white border-[#18A36C]"
                  : "border-gray-300 hover:bg-gray-50 text-gray-700"
              }`}
            >
              {pageNumber}
            </Button>
          );
        })}
      </div>

      {/* =>?:0 "?5@54" */}
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="outline"
        className="h-10 w-10 p-0 border-gray-300 hover:bg-gray-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed hidden sm:flex items-center justify-center"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
