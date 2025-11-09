    // Display mode - ILLUMINATED STAR APPEARANCE (no logo, just glow)
    return (
      <div className="p-2 text-center relative">
        {/* ILLUMINATED CORE - Bright center like a real star */}
        <motion.div
          className="w-4 h-4 bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 rounded-full mx-auto mb-1"
          style={{
            boxShadow: '0 0 10px rgba(255, 215, 0, 0.6), 0 0 20px rgba(255, 215, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7],
            boxShadow: [
              '0 0 8px rgba(255, 215, 0, 0.5), 0 0 15px rgba(255, 215, 0, 0.3)',
              '0 0 15px rgba(255, 215, 0, 0.8), 0 0 25px rgba(255, 215, 0, 0.5)',
              '0 0 8px rgba(255, 215, 0, 0.5), 0 0 15px rgba(255, 215, 0, 0.3)'
            ]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <h3 className="text-white font-medium text-xs truncate">{card.content.title}</h3>
        {card.content.tags && card.content.tags.length > 0 && (
          <div className="flex justify-center gap-1 mt-1">
            {card.content.tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="px-1 py-0.5 bg-white/10 rounded text-xs text-white/60">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );