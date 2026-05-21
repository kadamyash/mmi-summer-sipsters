import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Drinks menu
const DRINKS = [
  {
    id: 'solkadhi',
    name: 'Solkadhi',
    price: 30,
    emoji: '🥥',
    tagline: 'Coastal Coolness',
  },
  {
    id: 'aam-panna',
    name: 'Aam Panna',
    price: 30,
    emoji: '🥭',
    tagline: 'Tangy, Refreshing',
  },
  {
    id: 'boba-pineapple',
    name: 'Boba Tea (Pineapple)',
    price: 50,
    emoji: '🍍',
    tagline: 'Tropical Vibes',
  },
  {
    id: 'boba-coffee',
    name: 'Boba Tea (Coffee)',
    price: 50,
    emoji: '☕',
    tagline: 'Brewed Fresh',
  },
  {
    id: 'cupcakes',
    name: 'Cup cakes',
    price: 20,
    emoji: '🧁',
    tagline: 'Sweet Treats',
  },
  {
    id: 'boat-candy',
    name: 'Boat with candy',
    price: 20,
    emoji: '⛵️',
    tagline: 'Fun & Sweet',
  },
  {
    id: 'game',
    name: 'Game',
    price: 20,
    emoji: '🎲',
    tagline: 'Play & Win',
  },
];

export default function App() {
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Calculate total
  const total = selectedDrink ? selectedDrink.price * quantity : 0;

  // Select drink
  const handleSelectDrink = (drink) => {
    setSelectedDrink(drink);
    setQuantity(1);
    setStatus(null);
  };

  // Increase quantity
  const handleIncreaseQty = () => {
    setQuantity(quantity + 1);
  };

  // Decrease quantity
  const handleDecreaseQty = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Create order in Supabase
  const createOrderInSupabase = async () => {
    const orderId = `SS-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const orderData = {
      order_id: orderId,
      drink_id: selectedDrink.id,
      drink_name: selectedDrink.name,
      quantity: quantity,
      unit_price: selectedDrink.price,
      total_amount: total,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    try {
      if (!supabaseUrl.includes('YOUR_SUPABASE')) {
        const { error } = await supabase.from('orders').insert([orderData]);

        if (error) {
          console.warn('Supabase error:', error);
          // Continue anyway with order ID
        }
      } else {
        console.log('⚠️ Supabase not configured. Order ID:', orderId);
      }

      return orderId;
    } catch (error) {
      console.error('Error creating order:', error);
      // Still return order ID
      return orderId;
    }
  };

  // Generate UPI link
  const generateUPILink = (orderId, amount) => {
    return `upi://pay?appid=com.infra.uboinpci&tr=${orderId}&mc=&pa=touchmission@uboi&pn=TOUCH&tn=${encodeURIComponent(`${selectedDrink.name} x${quantity}`)}&am=${amount}&cu=INR`;
  };

  // Handle payment
  const handlePayment = async () => {
    if (!selectedDrink) return;

    setLoading(true);
    try {
      // Create order in Supabase
      const orderId = await createOrderInSupabase();

      if (!orderId) {
        throw new Error('Failed to create order');
      }

      setStatus({
        type: 'success',
        message: '✅ Order created! Redirecting to payment...',
      });

      // Generate UPI link
      const upiLink = generateUPILink(orderId, total);

      // Redirect to UPI after delay
      setTimeout(() => {
        window.location.href = upiLink;
      }, 500);
    } catch (error) {
      setStatus({
        type: 'error',
        message: `❌ ${error.message}`,
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-orange-400 to-orange-500 p-4 sm:p-6 font-baloo">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-5xl sm:text-6xl mb-4 animate-spin-slow">☀️</div>
          <h1 className="text-5xl sm:text-6xl font-black text-pink-600 leading-tight mb-2 drop-shadow-lg">
            SUMMER
            <br />
            SIPSTERS
          </h1>
          <p className="text-base sm:text-lg font-bold text-teal-700 tracking-widest">
            ❤️ SIP. SMILE. REPEAT.
          </p>
        </div>

        {/* Status Messages */}
        {status && (
          <div
            className={`mb-6 p-4 rounded-xl font-bold animate-slide-up ${
              status.type === 'error'
                ? 'bg-red-100 text-red-700 border-2 border-red-500'
                : 'bg-green-100 text-green-700 border-2 border-green-500'
            }`}
          >
            {status.message}
          </div>
        )}

        {/* Drinks Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8">
          {DRINKS.map((drink) => (
            <button
              key={drink.id}
              onClick={() => handleSelectDrink(drink)}
              className={`p-5 sm:p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 shadow-lg animate-pop-in ${
                selectedDrink?.id === drink.id
                  ? 'bg-gradient-to-br from-pink-100 to-yellow-50 border-4 border-pink-500 scale-105 shadow-2xl'
                  : 'bg-white border-4 border-transparent hover:border-pink-300'
              }`}
              style={{
                animationDelay: `${DRINKS.indexOf(drink) * 0.1}s`,
              }}
            >
              <div className="text-5xl sm:text-6xl mb-3 block">{drink.emoji}</div>
              <div className="font-black text-pink-600 text-lg sm:text-xl leading-tight mb-1">
                {drink.name}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-teal-600 mb-2">
                ₹{drink.price}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 italic">
                {drink.tagline}
              </div>
            </button>
          ))}
        </div>

        {/* Quantity Section */}
        {selectedDrink && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 mb-6 border-4 border-dashed border-pink-500 shadow-lg animate-slide-up">
            <label className="block text-xs sm:text-sm font-black text-teal-700 uppercase tracking-widest mb-6">
              📝 How Many?
            </label>
            <div className="flex items-center justify-center gap-6 sm:gap-8">
              <button
                onClick={handleDecreaseQty}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-pink-500 to-red-500 text-white font-black text-2xl sm:text-3xl hover:scale-110 active:scale-95 transition-all shadow-lg"
              >
                −
              </button>
              <div className="text-5xl sm:text-6xl font-black text-pink-600 min-w-20 text-center">
                {quantity}
              </div>
              <button
                onClick={handleIncreaseQty}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-pink-500 to-red-500 text-white font-black text-2xl sm:text-3xl hover:scale-110 active:scale-95 transition-all shadow-lg"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Summary Section */}
        {selectedDrink && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 mb-6 border-4 border-yellow-400 shadow-lg animate-slide-up">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center text-sm sm:text-base">
                <span className="font-bold text-teal-700">Drink</span>
                <span className="font-bold text-pink-600">{selectedDrink.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm sm:text-base">
                <span className="font-bold text-teal-700">Quantity</span>
                <span className="font-bold text-pink-600">{quantity}x</span>
              </div>
              <div className="flex justify-between items-center text-sm sm:text-base">
                <span className="font-bold text-teal-700">Unit Price</span>
                <span className="font-bold text-pink-600">₹{selectedDrink.price}</span>
              </div>
              <div className="border-t-4 border-dashed border-pink-500 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-teal-700">Subtotal</span>
                  <span className="text-2xl sm:text-3xl font-black text-red-500">
                    ₹{total}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={!selectedDrink || loading}
          className={`w-full py-4 sm:py-5 px-6 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-wider transition-all duration-300 mb-4 ${
            selectedDrink && !loading
              ? 'bg-gradient-to-br from-pink-500 to-red-500 text-white hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
          }`}
        >
          {!selectedDrink
            ? 'Select a drink to continue'
            : loading
              ? '⏳ Processing...'
              : `💳 PAY ₹${total}`}
        </button>

        {/* Info Text */}
        <p className="text-center text-sm sm:text-base font-bold text-teal-700 opacity-80">
          ✅ Secure UPI Payment • 📍 Order Tracked
        </p>
      </div>
    </div>
  );
}