import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, MessageCircle, Send } from 'lucide-react';
import { Analytics } from "@vercel/analytics/react"


const initialMessages = [
  "I love you so much that my heart skips a beat every time I see your name on my phone",
  "You make ordinary moments feel like magic just by being there",
  "I love you so much that even my dreams aren't big enough to contain it all",
  "Every song reminds me of you, every sunset makes me wish you were here",
  "I love you so much that words feel too small to hold this feeling",
  "The way our bodies fit together feels like the answer to a question I didn’t even know I was asking. Every brush of skin feels like home.",
  "When you hold me, it’s as if the whole world fades away — just the rhythm of our breathing and the warmth between us remain.",
  "Every touch feels like a sentence in a language only we speak, telling a story we’ve been writing since the moment we met.",
  "Lying beside you, I feel the universe slow down — as if time itself pauses to honor the way our bodies connect."
];

export default function ILoveYouSoMuch() {
  const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const [message, setMessage] = useState('');
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    setSubmissions(shuffleArray(initialMessages));
  }, []);

  const [hearts, setHearts] = useState([]);

 

  useEffect(() => {
    const createHeart = () => {
      const heart = {
        id: Date.now() + Math.random(),
        left: Math.random() * 100,
        animationDuration: 3 + Math.random() * 2
      };
      setHearts(prev => [...prev.slice(-10), heart]);
    };

    const interval = setInterval(createHeart, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = () => {
    if (message.trim()) {
      setSubmissions(prev => [message, ...prev]);
      setMessage('');
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fce7f3, #fdf2f8, #fef2f2)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    floatingHeart: {
      position: 'absolute',
      color: '#f9a8d4',
      opacity: 0.6,
      pointerEvents: 'none',
      fontSize: '24px'
    },
    mainContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 16px',
      position: 'relative',
      zIndex: 10
    },
    header: {
      textAlign: 'center',
      marginBottom: '48px'
    },
    headerIcons: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px'
    },
    title: {
      fontSize: '48px',
      fontWeight: 'bold',
      background: 'linear-gradient(to right, #dc2626, #e11d48)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      margin: 0
    },
    subtitle: {
      fontSize: '18px',
      color: '#6b7280',
      maxWidth: '600px',
      margin: '0 auto',
      lineHeight: 1.6
    },
    formSection: {
      maxWidth: '600px',
      margin: '0 auto 48px auto'
    },
    formCard: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      padding: '32px',
      border: '1px solid #fce7f3'
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#374151',
      margin: 0
    },
    textarea: {
      width: '100%',
      height: '120px',
      padding: '16px',
      border: '2px solid #fce7f3',
      borderRadius: '12px',
      fontSize: '16px',
      color: '#374151',
      background: 'rgba(252, 231, 243, 0.3)',
      resize: 'none',
      outline: 'none',
      fontFamily: 'inherit',
      marginBottom: '16px'
    },
    textareaFocus: {
      borderColor: '#f472b6'
    },
    formFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    charCount: {
      fontSize: '14px',
      color: '#6b7280'
    },
    submitButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'linear-gradient(to right, #ec4899, #ef4444)',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '12px',
      border: 'none',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    submitButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    messagesSection: {
      maxWidth: '1000px',
      margin: '0 auto'
    },
    messagesHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      justifyContent: 'center',
      marginBottom: '32px'
    },
    messagesGrid: {
      display: 'grid',
      gap: '24px',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
    },
    messageCard: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(252, 231, 243, 0.9))',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: '1px solid #fce7f3',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    messageContent: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    },
    messageText: {
      color: '#374151',
      lineHeight: 1.6,
      fontStyle: 'italic',
      margin: 0
    },
    messageFooter: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '16px',
      gap: '4px'
    },
    footer: {
      textAlign: 'center',
      marginTop: '64px',
      paddingBottom: '32px'
    },
    footerContent: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      color: '#6b7280'
    },
    pulseHeart: {
      animation: 'pulse 2s ease-in-out infinite'
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes float {
            0%, 100% { 
              transform: translateY(100vh) rotate(0deg); 
              opacity: 0; 
            }
            10%, 90% { 
              opacity: 0.6; 
            }
            50% { 
              transform: translateY(-20px) rotate(180deg); 
              opacity: 0.8; 
            }
          }
          @keyframes pulse {
            0%, 100% { 
              transform: scale(1); 
            }
            50% { 
              transform: scale(1.05); 
            }
          }
          .floating-heart {
            animation: float var(--duration) ease-in-out infinite;
          }
          .submit-button:hover:not(:disabled) {
            background: linear-gradient(to right, #be185d, #dc2626) !important;
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
          }
          .message-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
          }
          .textarea:focus {
            border-color: #f472b6;
          }

        `}
      </style>

      {/* Floating Hearts Background */}
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="floating-heart"
          style={{
            ...styles.floatingHeart,
            left: `${heart.left}%`,
            '--duration': `${heart.animationDuration}s`
          }}
        >
          <Heart size={24} fill="currentColor" />
        </div>
      ))}

      <div style={styles.mainContent}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerIcons}>
            <Heart size={48} color="#ef4444" fill="currentColor" style={styles.pulseHeart} />
            <h1 style={styles.title}>I Love You So Much</h1>
            <Heart size={48} color="#ec4899" fill="currentColor" style={styles.pulseHeart} />
          </div>
          <p style={styles.subtitle}>
            A place to express the overwhelming, beautiful, indescribable feeling of loving someone with your whole heart
          </p>
        </div>

        {/* Share Your Love Form */}
        <div style={styles.formSection}>
          <div style={styles.formCard}>
            <div style={styles.sectionHeader}>
              <Sparkles size={24} color="#ec4899" />
              <h2 style={styles.sectionTitle}>Share Your Love</h2>
            </div>
            <div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How much do you love them? Share your heart..."
                style={styles.textarea}
                className="textarea"
                maxLength={500}
              />
              <div style={styles.formFooter}>
                <span style={styles.charCount}>{message.length}/500</span>
                <button
                  onClick={handleSubmit}
                  disabled={!message.trim()}
                  style={{
                    ...styles.submitButton,
                    ...(message.trim() ? {} : styles.submitButtonDisabled)
                  }}
                  className="submit-button"
                >
                  <Send size={16} />
                  Send Love
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Love Messages */}
        <div style={styles.messagesSection}>
          <div style={styles.messagesHeader}>
            <MessageCircle size={24} color="#ef4444" />
            <h2 style={styles.sectionTitle}>Love Stories</h2>
          </div>
          
          <div style={styles.messagesGrid}>
            {submissions.map((submission, index) => (
              <div key={index} style={styles.messageCard} className="message-card">
                <div style={styles.messageContent}>
                  <Heart size={20} color="#f87171" fill="currentColor" style={{marginTop: '2px', flexShrink: 0}} />
                  <p style={styles.messageText}>"{submission}"</p>
                </div>
                <div style={styles.messageFooter}>
                  {[...Array(5)].map((_, i) => (
                    <Heart key={i} size={12} color="#f9a8d4" fill="currentColor" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      {/* Footer */}
<div 
  style={{
    ...styles.footer,
    background: "linear-gradient(90deg, #fce7f3, #fbcfe8, #fce7f3)",
    padding: "10px 0",
  }}
>
  <div style={styles.footerContent}>
    <Heart size={16} color="#f9a8d4" fill="currentColor" />
    <span style={{ margin: "0 6px" }}>
      Made with endless love by{" "}
      <a 
        href="https://pamelajterrell.com" 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{
          color: "#ec4899",
          textDecoration: "none",
          fontWeight: "bold",
        }}
        onMouseOver={(e) => e.target.style.textDecoration = "underline"}
        onMouseOut={(e) => e.target.style.textDecoration = "none"}
      >
        Pamela Terrell
      </a>
    </span>
    <Heart size={16} color="#f87171" fill="currentColor" />
  </div>
</div>

         < Analytics />
      </div>
    </div>
  );
}