import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ContextualSaveBarProps {
  isDirty: boolean;
  onSave: () => void;
  onDiscard: () => void;
  isSaving?: boolean;
}

export const ContextualSaveBar: React.FC<ContextualSaveBarProps> = ({
  isDirty,
  onSave,
  onDiscard,
  isSaving = false,
}) => {
  return (
    <AnimatePresence>
      {isDirty && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed top-0 left-0 right-0 h-14 bg-zinc-900 text-white flex items-center justify-between px-6 z-50 shadow-md border-b border-zinc-800"
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-xs sm:text-sm font-medium tracking-tight">Unsaved changes</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDiscard}
              disabled={isSaving}
              className="px-3.5 py-1.5 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white rounded-md transition disabled:opacity-50 cursor-pointer"
            >
              Discard
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white rounded-md shadow-sm transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
