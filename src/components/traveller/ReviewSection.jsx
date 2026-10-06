import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, CheckCircle2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { reviewService } from '../../services/reviewService';

export default function ReviewSection({ experienceId, currentRating = 5.0, currentReviewCount = 0 }) {
  const { currentUser, userProfile } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (!experienceId) return;
    const unsub = reviewService.subscribeExperienceReviews(
      experienceId,
      (data) => {
        setReviews(data);
        setLoading(false);
      },
      (err) => {
        console.error("Reviews load error:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [experienceId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please sign in to post a review.");
      return;
    }
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      await reviewService.addReview({
        experienceId,
        travellerId: currentUser.uid,
        travellerName: userProfile?.name || currentUser.displayName || 'Explorer',
        travellerPhoto: userProfile?.profilePicUrl || currentUser.photoURL || '',
        rating: newRating,
        comment: comment.trim(),
      });
      setComment('');
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    } catch (err) {
      console.error("Failed to post review:", err);
      alert("Error posting review: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Header & Rating score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-4">
        <div>
          <h3 className="font-bold text-lg text-neutral-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-traveller-mint" />
            Verified Explorer Reviews
          </h3>
          <p className="text-xs text-neutral-500">Real experiences from travelers who completed this trip.</p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          <span className="font-extrabold text-base text-neutral-900">{Number(currentRating).toFixed(1)}</span>
          <span className="text-xs text-neutral-500">
            ({reviews.length || currentReviewCount} {reviews.length === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      </div>

      {/* Review list */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-500">
            No reviews yet. Be the first explorer to review this trip!
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="p-4 rounded-2xl bg-white border border-neutral-200/80 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-traveller-lightMint flex items-center justify-center text-traveller-forestDark font-bold text-xs overflow-hidden">
                    {rev.travellerPhoto ? (
                      <img src={rev.travellerPhoto} alt={rev.travellerName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-traveller-forestDark" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-neutral-800">{rev.travellerName}</h5>
                    <span className="text-[10px] text-neutral-400">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Verified Traveler'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed pl-10">
                {rev.comment}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add Review Form */}
      {currentUser ? (
        <form onSubmit={handleSubmitReview} className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
          <h4 className="font-bold text-sm text-neutral-800">Leave a Review</h4>

          {/* Star selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Your Rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none"
                >
                  <Star
                    className={`w-5 h-5 cursor-pointer transition-colors ${
                      star <= (hoverRating || newRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-neutral-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            required
            rows="3"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details about the trail, guide hospitality, weather, and highlights..."
            className="w-full p-3 rounded-xl border border-neutral-200 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-traveller-mint bg-white"
          />

          <div className="flex items-center justify-between">
            {successMsg ? (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Review submitted!
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="px-5 py-2 rounded-xl bg-traveller-forestDark text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors flex items-center gap-1.5 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Review</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-neutral-100 text-center text-xs text-neutral-500">
          Sign in to leave a review for this expedition.
        </div>
      )}
    </div>
  );
}
