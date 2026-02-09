'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, AlertTriangle, CheckCircle, Star, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { gameStore } from '@/store/gameStore';
import { containsXSS } from '@/lib/utils';
import DOMPurify from 'dompurify';

export default function DOMXSSChallenge() {
  const { data: session, status } = useSession();
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [submittedFeedback, setSubmittedFeedback] = useState<string[]>([]);
  const [exploitDetected, setExploitDetected] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const feedbackDisplayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if challenge was already completed
    const state = gameStore.getGameState();
    setChallengeCompleted(state.completedChallenges.includes('dom-xss-feedback'));
  }, []);

  // Show sign-in screen if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-green-400 font-mono">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="max-w-md p-8 border border-green-400/30 rounded-lg bg-black/50">
          <h2 className="text-2xl font-mono font-bold text-green-400 mb-4">Sign In Required</h2>
          <p className="text-green-300/80 font-mono mb-6">
            Please sign in to access this challenge and track your progress.
          </p>
          <div className="flex space-x-4">
            <Link
              href="/signin"
              className="flex-1 px-6 py-3 bg-green-500/20 border border-green-400 text-green-400 rounded hover:bg-green-500/30 transition-colors text-center font-mono"
            >
              Sign In
            </Link>
            <Link
              href="/challenges"
              className="flex-1 px-6 py-3 border border-green-400/30 text-green-400/70 rounded hover:border-green-400 transition-colors text-center font-mono"
            >
              Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmitFeedback = () => {
    if (!feedback.trim()) return;

    // Check for XSS patterns
    const hasXSS = containsXSS(feedback);
    
    if (hasXSS) {
      setExploitDetected(true);
      gameStore.recordExploit('dom-xss-feedback', true);
      
      // Complete the challenge if it's a successful XSS exploit
      if (feedback.includes('<script>') || feedback.includes('javascript:') || feedback.includes('onerror')) {
        if (!challengeCompleted) {
          const points = gameStore.completeChallenge('dom-xss-feedback');
          setChallengeCompleted(true);
          alert(`🎉 Challenge Completed! You earned ${points} points!`);
        }
      }
    }

    // Add to submitted feedback list
    setSubmittedFeedback(prev => [...prev, feedback]);

    // Sanitize user-provided HTML before injecting into DOM
    if (feedbackDisplayRef.current) {
      const feedbackElement = document.createElement('div');
      feedbackElement.className = 'border border-green-400/20 p-4 rounded mb-2';

      const rawHtml = `
        <div class="flex items-center space-x-2 mb-2">
          <div class="flex">
            ${Array.from({length: rating}, (_, i) => '<span class="text-yellow-400">⭐</span>').join('')}
            ${Array.from({length: 5 - rating}, (_, i) => '<span class="text-gray-600">⭐</span>').join('')}
          </div>
          <span class="text-green-300/60 text-sm font-mono">${new Date().toLocaleTimeString()}</span>
        </div>
        <div class="text-green-300">${feedback}</div>
      `;

      // Use DOMPurify to remove dangerous markup while keeping harmless HTML
      feedbackElement.innerHTML = DOMPurify.sanitize(rawHtml);
      feedbackDisplayRef.current.appendChild(feedbackElement);
    }

    // Clear form
    setFeedback('');
    setRating(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <header className="border-b border-green-400/20 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/challenges"
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-mono font-bold neon-glow">
              DOM XSS - Feedback Form
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {exploitDetected && (
              <div className="flex items-center space-x-2 text-orange-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-mono text-sm">Exploit Detected!</span>
              </div>
            )}
            {challengeCompleted && (
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-mono text-sm">Completed</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        
        {/* Challenge Description */}
        <div className="terminal p-6 rounded-lg mb-6">
          <h2 className="text-lg font-mono text-green-400 mb-4">🎯 Mission Briefing</h2>
          <div className="space-y-2 text-green-300 font-mono text-sm">
            <p>You've discovered a startup's customer feedback form.</p>
            <p>Initial analysis shows the form might be vulnerable to DOM-based XSS.</p>
            <p>Your goal: Find a way to execute JavaScript code through the feedback submission.</p>
            <p className="text-orange-400">⚠️ This is a controlled environment - exploit away!</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Vulnerable Feedback Form */}
          <div className="terminal p-6 rounded-lg">
            <div className="flex items-center space-x-2 mb-6">
              <MessageCircle className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-mono text-green-400">Customer Feedback</h2>
            </div>
            
            <div className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-green-300 font-mono mb-2">
                  Rate your experience:
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-colors ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'
                      }`}
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Text */}
              <div>
                <label className="block text-green-300 font-mono mb-2">
                  Your feedback:
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us about your experience..."
                  className="w-full bg-gray-800 border border-green-400/20 rounded p-3 text-green-300 font-mono focus:border-green-400 focus:outline-none"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitFeedback}
                disabled={!feedback.trim() || rating === 0}
                className="bg-green-400 text-black px-6 py-2 rounded font-mono font-bold hover:bg-green-300 transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Feedback</span>
              </button>
            </div>
          </div>

          {/* Submitted Feedback Display */}
          <div className="terminal p-6 rounded-lg">
            <h2 className="text-xl font-mono text-green-400 mb-4">Recent Feedback</h2>
            
            <div className="max-h-96 overflow-y-auto">
              <div ref={feedbackDisplayRef}>
                {submittedFeedback.length === 0 ? (
                  <div className="text-green-300/60 text-center py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-mono">No feedback submitted yet...</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Exploit Hints */}
        <div className="terminal p-6 rounded-lg mt-6">
          <h3 className="text-lg font-mono text-green-400 mb-4">🔍 Analysis Tools</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="vulnerable-code">
              <h4 className="font-mono text-red-400 mb-2">Vulnerable Code Pattern:</h4>
              <code className="text-red-300 font-mono text-sm">
                feedbackElement.innerHTML = feedback;
              </code>
              <p className="text-red-300/70 text-xs mt-1">
                Direct DOM injection without sanitization
              </p>
            </div>

            <div className="bg-green-400/5 border-l-4 border-green-400 p-3">
              <h4 className="font-mono text-green-400 mb-2">Try These Payloads:</h4>
              <div className="space-y-1 font-mono text-xs">
                <div className="text-gray-300">&lt;script&gt;alert('XSS')&lt;/script&gt;</div>
                <div className="text-gray-300">&lt;img src=x onerror=alert('XSS')&gt;</div>
                <div className="text-gray-300">&lt;svg onload=alert('XSS')&gt;</div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {challengeCompleted && (
          <div className="terminal p-6 rounded-lg mt-6 border-green-400">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-mono font-bold text-green-400 mb-2">
                Challenge Completed! 🎉
              </h2>
              <p className="text-green-300 mb-4">
                You successfully exploited the DOM-based XSS vulnerability!
              </p>
              <div className="space-y-2 text-sm text-green-300/80">
                <p><strong>What you learned:</strong> How unsanitized user input can lead to script execution</p>
                <p><strong>Prevention:</strong> Always sanitize user input and use textContent instead of innerHTML</p>
                <p><strong>Real-world impact:</strong> XSS can steal cookies, session tokens, and user data</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}