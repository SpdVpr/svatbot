
import React, { useState } from 'react';
import { Review, ReviewSource } from '../../types';
import { Star, CheckCircle2 } from 'lucide-react';

interface ReviewsSectionProps {
  reviews: Review[];
  rating: number;
  reviewCount: number;
  googleRating?: number;
  googleReviewCount?: number;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ 
  reviews, 
  rating, 
  reviewCount,
  googleRating = 0,
  googleReviewCount = 0
}) => {
  const [activeSource, setActiveSource] = useState<ReviewSource>('svatbot');

  // Filter reviews based on source and take only the last 5
  const svatbotReviews = reviews.filter(r => r.source === 'svatbot').slice(0, 5);
  const googleReviews = reviews.filter(r => r.source === 'google').slice(0, 5);
  
  const displayedReviews = activeSource === 'svatbot' ? svatbotReviews : googleReviews;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-serif font-bold mb-6 text-stone-900 px-2">Hodnocení</h2>

      {/* Dual Dashboard Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        
        {/* Svatbot Card */}
        <div 
          onClick={() => setActiveSource('svatbot')}
          className={`
            cursor-pointer relative overflow-hidden rounded-2xl p-6 border transition-all duration-300
            ${activeSource === 'svatbot' 
              ? 'bg-stone-900 text-white shadow-lg scale-[1.02] border-stone-900' 
              : 'bg-white text-stone-900 border-stone-200 hover:border-stone-300 grayscale opacity-70 hover:grayscale-0 hover:opacity-100'
            }
          `}
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
               <div>
                 <h3 className="font-serif font-bold text-lg">Svatbot</h3>
                 <p className={`text-xs mt-1 ${activeSource === 'svatbot' ? 'text-stone-400' : 'text-stone-500'}`}>Ověřené recenze klientů</p>
               </div>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold text-xs ${activeSource === 'svatbot' ? 'bg-primary-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                 S.
               </div>
            </div>
            
            <div className="mt-6 flex items-end gap-3">
              <span className="text-5xl font-serif font-bold">{rating}</span>
              <div className="mb-1.5">
                <div className="flex gap-0.5 text-amber-400 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className={`text-xs ${activeSource === 'svatbot' ? 'text-stone-400' : 'text-stone-500'}`}>
                  {reviewCount} hodnocení
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Google Card */}
        <div 
          onClick={() => setActiveSource('google')}
          className={`
            cursor-pointer relative overflow-hidden rounded-2xl p-6 border transition-all duration-300
            ${activeSource === 'google' 
              ? 'bg-white ring-1 ring-blue-100 shadow-lg scale-[1.02] border-blue-200' 
              : 'bg-white text-stone-900 border-stone-200 hover:border-stone-300 grayscale opacity-70 hover:grayscale-0 hover:opacity-100'
            }
          `}
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
               <div>
                 <h3 className="font-serif font-bold text-lg text-stone-900">Google</h3>
                 <p className="text-xs mt-1 text-stone-500">Recenze z Google Maps</p>
               </div>
               {/* Google G Logo SVG */}
               <div className="w-8 h-8 bg-white rounded-full shadow-sm border border-stone-100 flex items-center justify-center p-1.5">
                 <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                 </svg>
               </div>
            </div>
            
            <div className="mt-6 flex items-end gap-3">
              <span className="text-5xl font-serif font-bold text-stone-900">{googleRating}</span>
              <div className="mb-1.5">
                <div className="flex gap-0.5 text-amber-400 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-xs text-stone-500">
                  {googleReviewCount} hodnocení
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Switcher */}
      <div className="flex justify-center mb-8">
        <div className="bg-stone-100 p-1 rounded-xl inline-flex">
          <button 
            onClick={() => setActiveSource('svatbot')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeSource === 'svatbot' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
          >
            Svatbot ({svatbotReviews.length})
          </button>
          <button 
            onClick={() => setActiveSource('google')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeSource === 'google' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
          >
            Google ({googleReviews.length})
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {displayedReviews.map((review) => (
          <div key={review.id} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-3">
               <div className="flex items-center gap-3">
                 {review.avatarUrl ? (
                   <img src={review.avatarUrl} alt={review.author} className="w-10 h-10 rounded-full object-cover border border-stone-100" />
                 ) : (
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${review.source === 'google' ? 'bg-blue-50 text-blue-600' : 'bg-stone-100 text-stone-500'}`}>
                     {review.author.charAt(0)}
                   </div>
                 )}
                 <div>
                   <h4 className="font-bold text-stone-900 text-sm">{review.author}</h4>
                   <div className="flex items-center gap-2">
                     <span className="text-xs text-stone-400">{review.date}</span>
                     {review.source === 'google' && (
                       <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-3 h-3 opacity-60" />
                     )}
                   </div>
                 </div>
               </div>
               <div className="flex gap-0.5 text-amber-400">
                 {[...Array(review.rating)].map((_, i) => (
                   <Star key={i} size={14} fill="currentColor" />
                 ))}
               </div>
             </div>
             
             <p className="text-stone-600 text-sm leading-relaxed">"{review.content}"</p>
             
             {review.weddingDate && review.source === 'svatbot' && (
               <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-50 rounded-md text-[10px] text-stone-500 font-medium uppercase tracking-wide">
                 <CheckCircle2 size={12} className="text-green-500" />
                 Svatba: {review.weddingDate}
               </div>
             )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
          <button className="text-sm font-bold text-stone-500 hover:text-stone-900 transition-colors">
            Zobrazit starší recenze
          </button>
      </div>

    </div>
  );
};
