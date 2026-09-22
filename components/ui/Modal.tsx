'use client';

import {
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type MouseEvent,
  type KeyboardEvent,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from './cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Max width of the modal panel, default 'max-w-lg' */
  maxWidth?: string;
  /** Whether clicking the backdrop closes the modal (default true) */
  closeOnBackdrop?: boolean;
  /** Whether pressing Escape closes the modal (default true) */
  closeOnEscape?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  maxWidth = 'max-w-lg',
  closeOnBackdrop = true,
  closeOnEscape = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Trap focus and handle Escape
  useEffect(() => {
    if (!isOpen) return;

    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    function onKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape' && closeOnEscape) {
        e.preventDefault();
        onClose();
      }
      // Basic focus trap
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);
    // Prevent scroll on body
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      previous?.focus();
    };
  }, [isOpen, onClose, closeOnEscape]);

  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (closeOnBackdrop && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-[6px]"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Panel wrapper — centres the panel */}
          <div
            className="fixed inset-0 z-[1001] flex items-center justify-center p-4"
            onClick={handleBackdropClick}
          >
            <motion.div
              key="panel"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={title ?? 'Dialog'}
              aria-describedby={description ? 'modal-desc' : undefined}
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
              className={cn(
                'relative w-full rounded-2xl',
                'bg-[#111111] border border-white/10 shadow-card',
                'outline-none',
                maxWidth,
                className,
              )}
            >
              {/* Header */}
              {(title || description) && (
                <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-white/8">
                  <div>
                    {title && (
                      <h2 className="font-display text-[16px] font-semibold text-[#F5F5F5] leading-snug">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p id="modal-desc" className="font-sans text-[13px] text-[#555555] mt-1">
                        {description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    aria-label="Close dialog"
                    className={cn(
                      'flex-shrink-0 text-[#555555] hover:text-[#A0A0A0]',
                      'transition-colors p-1 rounded-lg hover:bg-white/5',
                    )}
                  >
                    <X size={16} aria-hidden />
                  </button>
                </div>
              )}

              {/* Close when no header */}
              {!title && !description && (
                <button
                  onClick={onClose}
                  aria-label="Close dialog"
                  className={cn(
                    'absolute top-4 right-4',
                    'text-[#555555] hover:text-[#A0A0A0] transition-colors',
                    'p-1 rounded-lg hover:bg-white/5',
                  )}
                >
                  <X size={16} aria-hidden />
                </button>
              )}

              {/* Content */}
              <div className="px-6 py-5">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
