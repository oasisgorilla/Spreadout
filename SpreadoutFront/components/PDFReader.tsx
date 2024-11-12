'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { pdfFileState } from '../recoil/atoms';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFReaderProps {
  pageNumber: number;
}

export default function PDFReader({ pageNumber }: PDFReaderProps) {
  const pdfFile = useRecoilValue(pdfFileState);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [visiblePages, setVisiblePages] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    const initialVisiblePages = [
      pageNumber,
      Math.min(numPages, pageNumber + 1),
      Math.min(numPages, pageNumber + 2),
      Math.min(numPages, pageNumber + 3),
      Math.min(numPages, pageNumber + 4),
    ].filter((value, index, self) => self.indexOf(value) === index);
    setVisiblePages(initialVisiblePages);
  };

  const loadMorePages = (direction: 'up' | 'down') => {
    if (isLoading || !numPages) return;

    setIsLoading(true);
    setTimeout(() => {
      setVisiblePages((prev) => {
        const newPages = [...prev];
        if (direction === 'up' && newPages[0] > 1) {
          newPages.unshift(newPages[0] - 1);
        } else if (
          direction === 'down' &&
          newPages[newPages.length - 1] < numPages
        ) {
          newPages.push(newPages[newPages.length - 1] + 1);
        }
        return newPages;
      });
      setIsLoading(false);
    }, 10);
  };

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const scrollBottom = scrollHeight - scrollTop - clientHeight;

      if (scrollTop < clientHeight * 0.6) {
        loadMorePages('up');
      } else if (scrollBottom < clientHeight * 0.2) {
        loadMorePages('down');
      }
    }
  }, [visiblePages, numPages, isLoading]);

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const updateContainerWidth = useCallback(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }
  }, []);

  const debouncedUpdateContainerWidth = debounce(updateContainerWidth, 200);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(debouncedUpdateContainerWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    updateContainerWidth(); // 초기 너비 설정

    return () => {
      resizeObserver.disconnect();
    };
  }, [debouncedUpdateContainerWidth, updateContainerWidth]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  const calculateScale = () => {
    if (containerWidth === 0) return 1;
    const targetWidth = containerWidth - 60;
    return targetWidth / 595; // 595 is the default width of a PDF page
  };

  return (
    <div className="pdf-reader-wrapper relative h-full w-full">
      <div
        ref={containerRef}
        className="container mx-auto overflow-auto h-full w-full"
      >
        {pdfFile && (
          <Document
            file={pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
            className="w-full p-4"
          >
            {visiblePages.map((pageNum) => (
              <Page
                key={pageNum}
                pageNumber={pageNum}
                scale={calculateScale()}
                className="w-full h-auto mb-4 shadow-[2px_2px_8px_0_rgba(0,0,0,0.2)]"
              />
            ))}
          </Document>
        )}
        {numPages && (
          <p className="mt-4 text-sm text-gray-600">
            총 {numPages}페이지 중 {visiblePages[0]} -{' '}
            {visiblePages[visiblePages.length - 1]}페이지 표시 중
          </p>
        )}
      </div>
    </div>
  );
}
