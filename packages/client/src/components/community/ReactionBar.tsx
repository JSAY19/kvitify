import { motion } from 'framer-motion'
import { REACTION_EMOJIS, type ReactionAggregate, type ReactionEmoji } from '@kvitifai/shared'

export const EMOJI_GLYPH: Record<ReactionEmoji, string> = {
  like: '👍',
  love: '❤️',
  celebrate: '🎉',
  strong: '💪',
  pray: '🙏',
}

export const EMOJI_LABEL: Record<ReactionEmoji, string> = {
  like: 'Лайк',
  love: 'Поддерживаю',
  celebrate: 'Праздник',
  strong: 'Так держать',
  pray: 'Молюсь за тебя',
}

interface ReactionBarProps {
  reactions: ReactionAggregate[]
  myReaction: ReactionEmoji | null
  onReact: (emoji: ReactionEmoji) => void
  disabled?: boolean
}

export function ReactionBar({ reactions, myReaction, onReact, disabled }: ReactionBarProps) {
  const countOf = (e: ReactionEmoji) => reactions.find((r) => r.emoji === e)?.count ?? 0

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {REACTION_EMOJIS.map((emoji) => {
        const count = countOf(emoji)
        const active = myReaction === emoji
        return (
          <motion.button
            key={emoji}
            type="button"
            disabled={disabled}
            onClick={() => onReact(emoji)}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            aria-pressed={active}
            aria-label={EMOJI_LABEL[emoji]}
            title={EMOJI_LABEL[emoji]}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm transition-colors border ${
              active
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-700 dark:text-emerald-200 ring-1 ring-emerald-500/30'
                : 'bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-emerald-400/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-500/10'
            } disabled:opacity-50`}
          >
            <span className="text-base leading-none">{EMOJI_GLYPH[emoji]}</span>
            {count > 0 && (
              <span className={`text-xs font-medium tabular-nums ${active ? '' : 'text-slate-600 dark:text-slate-300'}`}>
                {count}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
