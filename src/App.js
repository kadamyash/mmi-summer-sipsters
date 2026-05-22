import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = 'https://kazimfubgossxmbbswo.supabase.co';
const supabaseKey = 'sb_publishable_coNHa3hdHVCi-sXPMn08-w_s1P9Z8WN';
const supabase = createClient(supabaseUrl, supabaseKey);

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
    emoji: '🚤',
    tagline: 'Fun & Sweet',
  },
  {
    id: 'game',
    name: 'Game',
    price: 20,
    emoji: '🎮',
    tagline: 'Play & Win',
  },
];

export default function App() {
  const [cart, setCart] = useState({}); // { drinkId: quantity }
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Add item to cart
  const handleAddToCart = (drink) => {
    setCart((prev) => ({
      ...prev,
      [drink.id]: (prev[drink.id] || 0) + 1,
    }));
    setStatus(null);
  };

  // Remove item from cart
  const handleRemoveFromCart = (drinkId) => {
    setCart((prev) => {
      const newCart = { ...prev };
      newCart[drinkId]--;
      if (newCart[drinkId] <= 0) {
        delete newCart[drinkId];
      }
      return newCart;
    });
  };

  // Clear entire cart
  const handleClearCart = () => {
    setCart({});
  };

  // Calculate total
  const total = Object.entries(cart).reduce((sum, [drinkId, qty]) => {
    const drink = DRINKS.find((d) => d.id === drinkId);
    return sum + (drink ? drink.price * qty : 0);
  }, 0);

  // Get cart items with details
  const cartItems = Object.entries(cart).map(([drinkId, quantity]) => {
    const drink = DRINKS.find((d) => d.id === drinkId);
    return {
      ...drink,
      quantity,
      subtotal: drink.price * quantity,
    };
  });

  // Create orders in Supabase
  const createOrdersInSupabase = async () => {
    const orderId = `SS-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const orders = [];

    // Create an order row for each item in cart
    for (const item of cartItems) {
      orders.push({
        order_id: orderId,
        drink_id: item.id,
        drink_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_amount: item.subtotal,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
    }

    try {
      if (!supabaseUrl.includes('YOUR_SUPABASE')) {
        const { error } = await supabase.from('orders').insert(orders);

        if (error) {
          console.warn('Supabase error:', error);
        }
      } else {
        console.log('⚠️ Supabase not configured. Order ID:', orderId);
      }

      return orderId;
    } catch (error) {
      console.error('Error creating orders:', error);
      return orderId;
    }
  };

  // Generate UPI link
  const generateUPILink = (orderId, amount) => {
    return `upi://pay?appid=com.infra.uboinpci&tr=${orderId}&mc=&pa=touchmission@uboi&pn=TOUCH&tn=Order&am=${amount}&cu=INR`;
  };

  // Handle payment
  const handlePayment = async () => {
    if (Object.keys(cart).length === 0) return;

    setLoading(true);
    try {
      // Create orders in Supabase
      const orderId = await createOrdersInSupabase();

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

        {/* Items Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8">
          {DRINKS.map((drink) => (
            <button
              key={drink.id}
              onClick={() => handleAddToCart(drink)}
              className={`p-5 sm:p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 shadow-lg animate-pop-in relative ${
                cart[drink.id]
                  ? 'bg-gradient-to-br from-pink-100 to-yellow-50 border-4 border-pink-500 scale-105 shadow-2xl'
                  : 'bg-white border-4 border-transparent hover:border-pink-300'
              }`}
              style={{
                animationDelay: `${DRINKS.indexOf(drink) * 0.1}s`,
              }}
            >
              {/* Quantity Badge */}
              {cart[drink.id] && (
                <div className="absolute -top-3 -right-3 bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-black text-lg">
                  {cart[drink.id]}
                </div>
              )}

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

        {/* Cart Section */}
        {Object.keys(cart).length > 0 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 mb-6 border-4 border-yellow-400 shadow-lg animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-pink-600">🛒 Your Cart</h2>
              <button
                onClick={handleClearCart}
                className="text-sm font-bold text-red-600 hover:text-red-800 underline"
              >
                Clear Cart
              </button>
            </div>

            {/* Cart Items */}
            <div className="space-y-3 mb-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center pb-3 border-b border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.emoji}</span>
                    <div>
                      <div className="font-bold text-pink-600">{item.name}</div>
                      <div className="text-sm text-gray-600">
                        ₹{item.price} × {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-teal-600">₹{item.subtotal}</div>
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 font-bold"
                    >
                      −
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t-4 border-dashed border-pink-500 pt-4">
              <div className="flex justify-between items-center">
                <span className="font-black text-lg text-teal-700">TOTAL</span>
                <span className="text-3xl sm:text-4xl font-black text-red-500">
                  ₹{total}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={Object.keys(cart).length === 0 || loading}
          className={`w-full py-4 sm:py-5 px-6 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-wider transition-all duration-300 mb-4 ${
            Object.keys(cart).length > 0 && !loading
              ? 'bg-gradient-to-br from-pink-500 to-red-500 text-white hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
          }`}
        >
          {Object.keys(cart).length === 0
            ? 'Add items to continue'
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