import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto pb-20 md:pb-8 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Brand Pillars Banner */}
        <div className="py-4 px-6 rounded-2xl bg-traveller-forestDark text-white text-center mb-10 shadow-sm">
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-emerald-200 uppercase">
            Locals ★ Offbeat ★ Immersive ★ Slow and Sustainable
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-neutral-100">
          {/* Logo & Pitch */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <img src="/app_logo.png" alt="The Locals" className="w-9 h-9 object-contain" />
              <span className="font-extrabold text-lg tracking-wider text-neutral-900 font-sans">
                THE LOCALS
              </span>
            </div>
            <p className="text-sm text-neutral-500 max-w-md leading-relaxed">
              Empowering indigenous Himalayan hosts and conscious explorers with verified offbeat routes, deep multi-day expeditions, and authentic community connections.
            </p>
          </div>

          {/* Real 4 Best Famous Expeditions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">Famous Expeditions</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><Link to="/explore?state=Ladakh" className="hover:text-traveller-mint transition-colors">Chadar Frozen River Trek</Link></li>
              <li><Link to="/explore?state=Uttarakhand" className="hover:text-traveller-mint transition-colors">Valley of Flowers & Hemkund</Link></li>
              <li><Link to="/explore?state=Himachal%20Pradesh" className="hover:text-traveller-mint transition-colors">Pin Parvati Pass Traverse</Link></li>
              <li><Link to="/explore?state=Nagaland" className="hover:text-traveller-mint transition-colors">Dzukou Valley & Hornbill Trail</Link></li>
            </ul>
          </div>

          {/* Contact Us - Email */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">Contact Us</h4>
            <div className="space-y-2 text-sm text-neutral-600">
              <p className="text-xs text-neutral-500 leading-relaxed">
                Have questions or need custom expedition planning? Email our support team:
              </p>
              <a 
                href="mailto:support@thelocals.in" 
                className="inline-flex items-center gap-1.5 font-bold text-traveller-forestDark hover:text-traveller-mint transition-colors text-sm underline underline-offset-4"
              >
                support@thelocals.in
              </a>
              <p className="text-[11px] text-neutral-400">
                General inquiries: <a href="mailto:contact@thelocals.in" className="hover:underline text-neutral-500">contact@thelocals.in</a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
          <p>© {new Date().getFullYear()} The Locals. Himalayan Discovery & Guides Network. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Verified Local Guides</span>
            <span>•</span>
            <span>Razorpay Secure</span>
            <span>•</span>
            <span>Firebase Synced</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
