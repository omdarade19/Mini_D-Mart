import React from 'react';
import { ShoppingBag, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-800 text-dmart-500 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h5 className="text-white font-bold text-sm">Fresh Daily Quality</h5>
              <p className="text-xs text-slate-400 mt-1">Handpicked fresh produce & essential daily items.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-800 text-dmart-500 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h5 className="text-white font-bold text-sm">Express Home Delivery</h5>
              <p className="text-xs text-slate-400 mt-1">Fast doorstep delivery or scheduled store pickup.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-800 text-dmart-500 rounded-xl">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h5 className="text-white font-bold text-sm">7-Day Easy Returns</h5>
              <p className="text-xs text-slate-400 mt-1">Hassle-free 7-day return and exchange policy.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-800 text-dmart-500 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h5 className="text-white font-bold text-sm">Best Value Prices</h5>
              <p className="text-xs text-slate-400 mt-1">Unbeatable D-Mart wholesale pricing every day.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-dmart-600 text-white rounded-md flex items-center justify-center font-black text-xs">
              D
            </div>
            <span className="font-bold text-slate-300">Mini D-Mart Grocery Store</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <p>Production-Quality Minimal Grocery Assessment Project</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
