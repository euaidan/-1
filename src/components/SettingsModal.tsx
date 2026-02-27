import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Upload, Trash2, Settings, ShieldAlert, Database } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  onExport: () => void;
  onExportHtml: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

export default function SettingsModal({ onClose, onExport, onExportHtml, onImport, onClear }: SettingsModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-white/60" />
            <h3 className="text-xl font-bold">系统设置</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <button
            onClick={onExport}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Save className="w-5 h-5 text-emerald-400" />
              <div className="text-left">
                <div className="font-bold">导出存档 (JSON)</div>
                <div className="text-[10px] text-white/40">将当前进度保存为 JSON 文件</div>
              </div>
            </div>
          </button>

          <button
            onClick={onExportHtml}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-orange-400" />
              <div className="text-left">
                <div className="font-bold">导出存档 (HTML)</div>
                <div className="text-[10px] text-white/40">将当前进度保存为网页文件</div>
              </div>
            </div>
          </button>

          <label className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group cursor-pointer">
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <div className="font-bold">导入存档</div>
                <div className="text-[10px] text-white/40">从文件恢复游戏进度</div>
              </div>
            </div>
            <input type="file" className="hidden" onChange={onImport} accept=".json" />
          </label>

          <div className="pt-4 border-t border-white/5">
            <button
              onClick={onClear}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-500" />
                <div className="text-left">
                  <div className="font-bold text-red-500">清除数据</div>
                  <div className="text-[10px] text-red-500/60">彻底删除所有本地存档</div>
                </div>
              </div>
              <ShieldAlert className="w-4 h-4 text-red-500/40" />
            </button>
          </div>
        </div>

        <div className="p-4 bg-white/5 text-center">
          <p className="text-[10px] text-white/20">游戏会自动保存到本地浏览器缓存</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
