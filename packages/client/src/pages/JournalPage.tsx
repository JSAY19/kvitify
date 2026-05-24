import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Trash2, Smile, Meh, Frown } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: number | null;
  createdAt: string;
}

const MOOD_ICONS = [Frown, Meh, Smile];
const MOOD_LABELS = ['Плохо', 'Нормально', 'Хорошо'];

export function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchEntries = useCallback(() => {
    api.get('/journal').then((r) => setEntries(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await api.post('/journal', { title, content, mood });
      setShowModal(false);
      setTitle('');
      setContent('');
      setMood(null);
      fetchEntries();
      toast.success('Запись добавлена');
    } catch {
      toast.error('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/journal/${id}`);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success('Запись удалена');
    } catch {
      toast.error('Ошибка при удалении');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="text-primary-500" /> Дневник
        </h1>
        <Button onClick={() => setShowModal(true)} size="sm">
          <Plus size={18} className="mr-1" /> Записать
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <Card className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Здесь пока пусто</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Создайте первую запись в дневнике</p>
        </Card>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {entries.map((entry, i) => {
              const MoodIcon = entry.mood != null ? MOOD_ICONS[Math.min(2, Math.floor(entry.mood / 4))] : null;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{entry.title}</h3>
                        <p className="text-xs text-slate-400">
                          {new Date(entry.createdAt).toLocaleDateString('ru-RU', {
                            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {MoodIcon && <MoodIcon size={18} className="text-primary-500" />}
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                          aria-label="Удалить"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{entry.content}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Новая запись">
        <div className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Заголовок"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:border-primary-500 outline-none"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Как вы себя чувствуете?"
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:border-primary-500 outline-none resize-none"
          />
          <div>
            <p className="text-sm text-slate-500 mb-2">Настроение</p>
            <div className="flex gap-3">
              {MOOD_LABELS.map((label, idx) => {
                const Icon = MOOD_ICONS[idx]!;
                const val = idx * 4 + 2;
                return (
                  <button
                    key={label}
                    onClick={() => setMood(val)}
                    className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors ${
                      mood === val
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Icon size={24} className={mood === val ? 'text-primary-500' : 'text-slate-400'} />
                    <span className="text-xs">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <Button onClick={handleCreate} loading={saving} className="w-full">
            Сохранить
          </Button>
        </div>
      </Modal>
    </div>
  );
}
